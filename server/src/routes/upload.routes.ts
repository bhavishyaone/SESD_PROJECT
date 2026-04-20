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

// Configure Cloudinary independently so this module can generate signed URLs
// without relying on import order or the upload middleware being loaded first.
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
 * Extract publicId, resourceType, format from a Cloudinary CDN URL.
 *
 * URL format:
 *   https://res.cloudinary.com/<cloud>/<resource_type>/upload/[v<version>/]<public_id>.<ext>
 */
function extractCloudinaryInfo(
  url: string
): { publicId: string; resourceType: string; format: string } | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('cloudinary.com')) return null;

    const parts = urlObj.pathname.split('/').filter(Boolean);
    // parts: [cloud, resource_type, 'upload', ...version?, public_id.ext]
    if (parts.length < 4 || parts[2] !== 'upload') return null;

    const resourceType = parts[1]; // 'image' | 'video' | 'raw'

    // Skip optional version segment like 'v1234567890'
    let idx = 3;
    if (parts[idx] && /^v\d+$/.test(parts[idx])) idx++;

    const publicIdWithExt = parts.slice(idx).join('/');
    const lastDot = publicIdWithExt.lastIndexOf('.');
    const publicId  = lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;
    const format    = lastDot !== -1 ? publicIdWithExt.substring(lastDot + 1) : '';

    console.log('[Cloudinary extract]', { resourceType, publicId, format });
    return { publicId, resourceType, format };
  } catch {
    return null;
  }
}

/**
 * Generate a Cloudinary private_download_url.
 *
 * This produces: https://api.cloudinary.com/v1_1/<cloud>/<resource_type>/download?
 *                public_id=...&api_key=...&timestamp=...&expires_at=...&signature=...
 *
 * The credentials are embedded in the URL — both the browser AND our server
 * can access it without any additional authentication headers.
 * Valid for 1 hour (expires_at).
 */
function getPrivateDownloadUrl(
  publicId: string,
  format: string,
  resourceType: string
): string {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  return (cloudinary.utils as any).private_download_url(publicId, format, {
    resource_type: resourceType,
    type: 'upload',
    expires_at: expiresAt,
  });
}

/**
 * Fetch a URL, following HTTP redirects, and stream the body to `res`
 * with the given Content-Disposition header.
 *
 * Uses Cloudinary's API endpoint (api.cloudinary.com), which authenticates
 * via signed query params — no User-Agent tricks needed.
 */
function fetchAndStream(
  fetchUrl: string,
  res: Response,
  contentDisposition: string,
  maxRedirects = 5
): void {
  const get = fetchUrl.startsWith('https') ? https.get : http.get;

  const req = get(fetchUrl, { timeout: 20000 }, (remote: IncomingMessage) => {
    const { statusCode, headers } = remote;

    // Follow redirects
    if ([301, 302, 307, 308].includes(statusCode!) && headers.location) {
      remote.resume();
      if (maxRedirects > 0) {
        return fetchAndStream(headers.location, res, contentDisposition, maxRedirects - 1);
      }
      if (!res.headersSent) res.status(502).json({ status: 'error', message: 'Too many redirects' });
      return;
    }

    if (statusCode !== 200) {
      remote.resume();
      console.error(`[Proxy] Remote returned HTTP ${statusCode}`);
      if (!res.headersSent)
        res.status(statusCode || 502).json({
          status: 'error',
          message: `Remote returned HTTP ${statusCode}`,
        });
      return;
    }

    res.setHeader('Content-Type', headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Disposition', contentDisposition);
    res.removeHeader('X-Frame-Options'); // Allow cross-origin iframe (Vercel ↔ Render)
    if (headers['content-length']) res.setHeader('Content-Length', headers['content-length']);

    remote.pipe(res as any);
    remote.on('error', () => { if (!res.headersSent) res.status(502).end(); });
  });

  req.on('timeout', () => {
    req.destroy();
    if (!res.headersSent) res.status(504).json({ status: 'error', message: 'Timed out fetching file' });
  });

  req.on('error', (err) => {
    console.error('[Proxy error]', err.message);
    if (!res.headersSent) res.status(502).json({ status: 'error', message: err.message });
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/upload/view?url=<cloudinaryUrl>
 *
 * Generates a private_download_url (API-authenticated), fetches the file
 * on the server side, and streams it back with Content-Disposition: inline
 * so an <iframe> can render the PDF.
 *
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

  const filename = url.split('?')[0].split('/').pop() || 'document.pdf';
  const info = extractCloudinaryInfo(url);

  if (info && process.env.CLOUDINARY_API_SECRET) {
    try {
      const apiUrl = getPrivateDownloadUrl(info.publicId, info.format, info.resourceType);
      console.log('[View] Fetching via private_download_url (api.cloudinary.com)');
      fetchAndStream(apiUrl, res, `inline; filename="${filename}"`);
      return;
    } catch (e) {
      console.error('[View] SDK error:', e);
    }
  } else {
    console.warn('[View] Cloudinary SDK not configured or URL not parseable — falling back to direct fetch');
  }

  // Fallback: try direct URL (works for public resources)
  fetchAndStream(url, res, `inline; filename="${filename}"`);
});

/**
 * GET /api/upload/download?url=<cloudinaryUrl>&token=<jwt>
 *
 * Generates a private_download_url, then 302-redirects the browser to it.
 * The browser follows the redirect to api.cloudinary.com (credentials in URL),
 * downloads the file with Content-Disposition: attachment — no new tab.
 *
 * Accepts JWT via query param because browser anchor-click navigation
 * cannot send Authorization headers.
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

  if (info && process.env.CLOUDINARY_API_SECRET) {
    try {
      const apiUrl = getPrivateDownloadUrl(info.publicId, info.format, info.resourceType);
      console.log('[Download] Redirecting to private_download_url');
      res.redirect(302, apiUrl);
      return;
    } catch (e) {
      console.error('[Download] SDK error:', e);
    }
  }

  // Fallback: redirect to original URL
  res.redirect(302, url);
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
