import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificate.service';

export class CertificateController {
  private certificateService: CertificateService;

  constructor() {
    this.certificateService = new CertificateService();
  }

  public generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cert = await this.certificateService.generateCertificate(req.body);
      res.status(201).json({ status: 'success', data: cert });
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
