import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static logout(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static forgotPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyOtp(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static resetPassword(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=auth.controller.d.ts.map