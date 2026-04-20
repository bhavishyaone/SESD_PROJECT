import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { v2 as cloudinary } from 'cloudinary';
import https from 'https';
import http from 'http';
import { IncomingMessage } from 'http';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Cloudinary must be configured here independently so this router
// can generate signed URLs without relying on import order.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isAllowedUrl(url: string): boolean {
  return (
    url.includes('cloudinary.com') ||
    url.startsWith('/uploads/') ||
    url.startsWith('http://localhost')
  );
}

/**
 * Parse the public_id, resource_type and format from a Cloudinary CDN URL.
 * URL format: https://res.cloudinary.com/<cloud>/<resource_type>/upload/[v<ver>/]<public_id>.<ext>
 */
function extractCloudinaryInfo(
  url: string
): { publicId: string; resourceType: string; format: string } | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('cloudinary.com')) return null;

    // pathname: /<cloud>/<resource_type>/upload/[v<version>/]<public_id>.<format>
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 4 || parts[2] !== 'upload') return null;

    const resourceType = parts[1]; // 'image' | 'video' | 'raw'

    // Skip optional version segment like 'v1234567890'
    let idx = 3;
    if (parts[idx] && /^v\d+$/.test(parts[idx])) idx++;

    const publicIdWithExt = parts.slice(idx).join('/');
    const lastDot = publicIdWithExt.lastIndexOf('.');
    const publicId =
      lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;
    const format = lastDot !== -1 ? publicIdWithExt.substring(lastDot + 1) : '';

    return { publicId, resourceType, format };
  } catch {
    return null;
  }
}

/**
 * Fetch a URL and pipe it to `res`, following HTTP redirects.
 * Node's https.get does NOT auto-follow redirects.
 */
function fetchAndStream(
  fetchUrl: string,
  res: Response,
  contentDisposition: string,
  maxRedirects = 5
): void {
  const get = fetchUrl.startsWith('https') ? https.get : http.get;

  const req = get(fetchUrl, { timeout: 15000 }, (remote: IncomingMessage) => {
    const { statusCode, headers } = remote;

    // Follow redirects
    if ([301, 302, 307, 308].includes(statusCode!) && headers.location) {
      remote.resume();
      if (maxRedirects > 0) {
        return fetchAndStream(headers.location, res, contentDisposition, maxRedirects - 1);
      }
      if (!res.headersSent)
        res.status(502).json({ status: 'error', message: 'Too many redirects' });
      return;
    }

    if (statusCode !== 200) {
      remote.resume();
      if (!res.headersSent)
        res.status(statusCode || 502).json({
          status: 'error',
          message: `Remote server returned HTTP ${statusCode}`,
        });
      return;
    }

    const contentType = headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDisposition);
    if (headers['content-length']) res.setHeader('Content-Length', headers['content-length']);

    remote.pipe(res as any);
    remote.on('error', () => { if (!res.headersSent) res.status(502).end(); });
  });

  req.on('timeout', () => {
    req.destroy();
    if (!res.headersSent)
      res.status(504).json({ status: 'error', message: 'Remote server timed out' });
  });

  req.on('error', (err) => {
    console.error('[Proxy fetch error]', err.message);
    if (!res.headersSent)
      res.status(502).json({ status: 'error', message: 'Failed to reach file server' });
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/upload/view?url=<cloudinaryUrl>
 *
 * Serves the file inline (for <iframe> PDF rendering).
 * Uses a Cloudinary signed URL to bypass any auth restrictions,
 * then proxies through our server with Content-Disposition: inline.
 * No JWT required — iframes cannot send Authorization headers.
 */
router.get('/view', (req: Request, res: Response): void => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ status: 'error', message: 'url query param is required' });
    return;
  }
  if (!isAllowedUrl(url)) {
    res.status(400).json({ status: 'error', message: 'URL not allowed' });
    return;
  }

  const info = extractCloudinaryInfo(url);
  const filename =
    url.split('?')[0].split('/').pop() || 'document.pdf';

  if (info && process.env.CLOUDINARY_API_SECRET) {
    try {
      // Generate a signed URL — bypasses private/authenticated delivery configs.
      const signedUrl = cloudinary.url(info.publicId, {
        resource_type: info.resourceType as any,
        format: info.format || undefined,
        sign_url: true,
        type: 'upload',
        secure: true,
      });
      console.log('[View proxy] Signed URL:', signedUrl);
      fetchAndStream(signedUrl, res, `inline; filename="${filename}"`);
      return;
    } catch (e) {
      console.error('[View proxy] Failed to generate signed URL, falling back:', e);
    }
  }

  // Fallback: proxy the raw URL directly
  fetchAndStream(url, res, `inline; filename="${filename}"`);
});

/**
 * GET /api/upload/download?url=<cloudinaryUrl>
 *
 * Forces a file download via Cloudinary's private_download_url API.
 * This generates a time-limited (1 hour) authenticated download link
 * so the browser always saves the file locally.
 * Requires a valid JWT.
 */
router.get('/download', authMiddleware, (req: Request, res: Response): void => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ status: 'error', message: 'url query param is required' });
    return;
  }
  if (!isAllowedUrl(url)) {
    res.status(400).json({ status: 'error', message: 'URL not allowed' });
    return;
  }

  const info = extractCloudinaryInfo(url);
  const filename = url.split('?')[0].split('/').pop() || 'download.pdf';

  if (info && process.env.CLOUDINARY_API_SECRET) {
    try {
      // private_download_url generates an authenticated API download URL.
      // It uses our API key+secret to sign and is valid for 1 hour.
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      const downloadUrl = (cloudinary.utils as any).private_download_url(
        info.publicId,
        info.format,
        {
          resource_type: info.resourceType,
          type: 'upload',
          expires_at: expiresAt,
        }
      );
      console.log('[Download proxy] Redirecting to private_download_url');
      // Redirect — Cloudinary's API serves the file with attachment headers
      res.redirect(302, downloadUrl);
      return;
    } catch (e) {
      console.error('[Download proxy] Failed to generate download URL, falling back:', e);
    }
  }

  // Fallback: proxy with attachment header
  fetchAndStream(url, res, `attachment; filename="${filename}"`);
});

/**
 * POST /api/upload
 * Uploads a file to Cloudinary (instructors only).
 */
router.post('/', authMiddleware, roleMiddleware('instructor'), (req: Request, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[Upload Error]', err);
      return res.status(500).json({ status: 'error', message: err.message || 'File upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }
    const fileUrl = (req.file as any).path;
    return res.status(200).json({
      status: 'success',
      data: { fileUrl, originalName: req.file.originalname, mimetype: req.file.mimetype },
    });
  });
});

export default router;
