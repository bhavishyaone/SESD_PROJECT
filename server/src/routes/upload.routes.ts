import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import https from 'https';
import http from 'http';
import { IncomingMessage } from 'http';

const router = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Cloudinary raw resources return 401 without fl_attachment in the URL.
 * We inject it server-side so the file is accessible, then we set our OWN
 * Content-Disposition header (inline or attachment) for the browser.
 */
function toCloudinaryFetchUrl(url: string): string {
  if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.includes('fl_attachment')) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
}

function isAllowedUrl(url: string): boolean {
  return url.includes('cloudinary.com') || url.startsWith('/uploads/') || url.startsWith('http://localhost');
}

/**
 * Fetch a remote URL, following up to `maxRedirects` HTTP redirects
 * (Node's https.get does NOT auto-follow redirects), and stream the
 * response body to `res` with the given Content-Disposition header.
 */
function proxyStream(
  originalUrl: string,
  res: Response,
  contentDisposition: string,
  maxRedirects = 5,
): void {
  const fetchUrl = toCloudinaryFetchUrl(originalUrl);
  const get = fetchUrl.startsWith('https') ? https.get : http.get;

  const request = get(fetchUrl, { timeout: 15000 }, (remote: IncomingMessage) => {
    const status = remote.statusCode ?? 502;

    // Follow redirects
    if ([301, 302, 307, 308].includes(status) && remote.headers.location) {
      remote.resume(); // drain so socket is freed
      if (maxRedirects > 0) {
        return proxyStream(remote.headers.location, res, contentDisposition, maxRedirects - 1);
      }
      if (!res.headersSent) {
        res.status(502).json({ status: 'error', message: 'Too many redirects from remote server' });
      }
      return;
    }

    if (status !== 200) {
      remote.resume();
      if (!res.headersSent) {
        res.status(status).json({ status: 'error', message: `Remote server returned HTTP ${status}` });
      }
      return;
    }

    const contentType = remote.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDisposition);
    // Allow iframes to load this without CORS issues
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    if (remote.headers['content-length']) {
      res.setHeader('Content-Length', remote.headers['content-length']);
    }

    remote.pipe(res);
    remote.on('error', (err) => {
      console.error('[ProxyStream pipe error]', err.message);
      if (!res.headersSent) res.status(502).end();
    });
  });

  request.on('error', (err) => {
    console.error('[ProxyStream request error]', err.message);
    if (!res.headersSent) {
      res.status(502).json({ status: 'error', message: 'Failed to reach remote file server' });
    }
  });

  request.on('timeout', () => {
    request.destroy();
    if (!res.headersSent) {
      res.status(504).json({ status: 'error', message: 'Remote file server timed out' });
    }
  });
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * GET /api/upload/view?url=<cloudinaryUrl>
 * Streams the file with Content-Disposition: inline so the browser renders
 * it inside an <iframe>. No auth required (iframe can't send headers), but
 * only Cloudinary/local URLs are proxied.
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
  proxyStream(url, res, `inline; filename="${filename}"`);
});

/**
 * GET /api/upload/download?url=<cloudinaryUrl>
 * Streams the file with Content-Disposition: attachment so the browser
 * saves it locally. Requires a valid JWT (authenticated students only).
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
  const filename = url.split('?')[0].split('/').pop() || 'download.pdf';
  proxyStream(url, res, `attachment; filename="${filename}"`);
});

/**
 * POST /api/upload
 * Uploads a file (instructor only) to Cloudinary via multer-storage-cloudinary.
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
