import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare class UserController {
    static getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updatePrivacy(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=user.controller.d.ts.map