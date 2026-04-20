import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import https from 'https';
import http from 'http';
import { IncomingMessage } from 'http';

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
 * Inject fl_attachment into Cloudinary URLs so the CDN serves the raw file.
 * Raw Cloudinary resources require this flag to be delivered.
 */
function toFetchUrl(url: string): string {
  if (
    url.includes('cloudinary.com') &&
    url.includes('/upload/') &&
    !url.includes('fl_attachment')
  ) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
}

/**
 * Fetch a remote URL (with redirect following) and stream the body to `res`.
 *
 * IMPORTANT: We pass browser-like headers because Cloudinary's CDN blocks
 * server-to-server requests that lack a User-Agent header with HTTP 401.
 */
function fetchAndStream(
  fetchUrl: string,
  res: Response,
  contentDisposition: string,
  maxRedirects = 5,
): void {
  const get = fetchUrl.startsWith('https') ? https.get : http.get;

  const req = get(
    fetchUrl,
    {
      timeout: 20000,
      headers: {
        // Cloudinary CDN returns 401 for requests without a real User-Agent
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/pdf,application/octet-stream,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Connection: 'keep-alive',
      },
    },
    (remote: IncomingMessage) => {
      const { statusCode, headers } = remote;

      // Follow redirects — Node's https.get does NOT auto-follow
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
        console.error(`[Proxy] Remote returned ${statusCode} for ${fetchUrl}`);
        if (!res.headersSent)
          res.status(statusCode || 502).json({
            status: 'error',
            message: `Remote server returned HTTP ${statusCode}`,
          });
        return;
      }

      const contentType = headers['content-type'] || 'application/octet-stream';
      // We set our OWN Content-Disposition — ignore what Cloudinary sends
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', contentDisposition);
      if (headers['content-length']) res.setHeader('Content-Length', headers['content-length']);
      // Allow cross-origin iframes (Vercel ↔ Render)
      res.removeHeader('X-Frame-Options');

      remote.pipe(res as any);
      remote.on('error', () => { if (!res.headersSent) res.status(502).end(); });
    },
  );

  req.on('timeout', () => {
    req.destroy();
    if (!res.headersSent)
      res.status(504).json({ status: 'error', message: 'Remote server timed out' });
  });

  req.on('error', (err) => {
    console.error('[Proxy error]', err.message);
    if (!res.headersSent)
      res.status(502).json({ status: 'error', message: 'Failed to reach file server' });
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/upload/view?url=<cloudinaryUrl>
 *
 * Proxies the Cloudinary file server-side with a browser User-Agent,
 * then serves it with Content-Disposition: inline so an <iframe> can
 * render it. No auth required — iframes cannot send Authorization headers.
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
  const fetchUrl = toFetchUrl(url);
  console.log('[View] Fetching:', fetchUrl);
  fetchAndStream(fetchUrl, res, `inline; filename="${filename}"`);
});

/**
 * GET /api/upload/download?url=<cloudinaryUrl>
 *
 * Redirects the browser directly to the Cloudinary fl_attachment URL.
 * Because the browser makes this request (not our server), Cloudinary
 * accepts it. Content-Disposition: attachment causes a file save with
 * NO new tab opening.
 * Requires a valid JWT (authenticated students only).
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

  // Redirect browser directly to the fl_attachment URL.
  // The browser can access Cloudinary (200); our server cannot (401 from CDN).
  const downloadUrl = toFetchUrl(url);
  console.log('[Download] Redirecting to:', downloadUrl);
  res.redirect(302, downloadUrl);
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
