import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import https from 'https';
import http from 'http';

const router = Router();

// Proxy download endpoint — fetches the file server-side from Cloudinary
// (avoiding browser CORS restrictions) and streams it back with a
// Content-Disposition: attachment header to force a browser download.
router.get('/download', authMiddleware, (req: Request, res: Response): void => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ status: 'error', message: 'url query param required' });
    return;
  }

  // Security: only proxy Cloudinary URLs or local /uploads/ paths
  const isCloudinary = url.includes('cloudinary.com');
  const isLocal = url.startsWith('/uploads/') || url.startsWith('http://localhost');
  if (!isCloudinary && !isLocal) {
    res.status(400).json({ status: 'error', message: 'Only Cloudinary or local upload URLs are allowed' });
    return;
  }

  // Derive a sane filename from the URL (strip transformations & query params)
  const rawPath = url.split('?')[0];
  const segments = rawPath.split('/');
  const filename = segments[segments.length - 1] || 'download.pdf';

  // Choose http/https module based on protocol
  const get = url.startsWith('https') ? https.get : http.get;

  get(url, (fileRes) => {
    if (fileRes.statusCode !== 200) {
      res.status(fileRes.statusCode || 502).json({
        status: 'error',
        message: `Remote file returned ${fileRes.statusCode}`,
      });
      return;
    }

    const contentType = fileRes.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    if (fileRes.headers['content-length']) {
      res.setHeader('Content-Length', fileRes.headers['content-length']);
    }

    fileRes.pipe(res);
  }).on('error', (err) => {
    console.error('[Download Proxy Error]', err.message);
    if (!res.headersSent) {
      res.status(502).json({ status: 'error', message: 'Failed to fetch remote file' });
    }
  });
});

router.post('/', authMiddleware, roleMiddleware('instructor'), (req: Request, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[Upload Error]', err);
      return res.status(500).json({
        status: 'error',
        message: err.message || 'File upload failed',
      });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const fileUrl = (req.file as any).path;

    return res.status(200).json({
      status: 'success',
      data: {
        fileUrl,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
      },
    });
  });
});

export default router;
