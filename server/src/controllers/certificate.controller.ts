import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificate.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class CertificateController {
  private certificateService: CertificateService;

  constructor() {
    this.certificateService = new CertificateService();
  }

  public generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, courseId } = req.body;
      const cert = await this.certificateService.generateCertificate(studentId, courseId);
      res.status(201).json({ status: 'success', data: cert });
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = (req.query.studentId as string) || req.user!.id;
      const certs = await this.certificateService.getCertificatesByStudent(studentId);
      res.status(200).json({ status: 'success', data: certs });
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cert = await this.certificateService.getCertificate(req.params.id);
      res.status(200).json({ status: 'success', data: cert });
    } catch (err) {
      next(err);
    }
  };
}
