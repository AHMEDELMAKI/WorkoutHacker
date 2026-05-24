import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../utils/jwt';
export interface AuthRequest extends Request {
    user?: AccessTokenPayload;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authenticate.d.ts.map