import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

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
