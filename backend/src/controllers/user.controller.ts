import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { UserService } from '../services/user.service';
import { sendSuccess, sendError } from '../common/response';

export class UserController {
    static async getMe(req: AuthRequest, res: Response) {
        try {
            const user = await UserService.getMe(req.user!.sub);
            return sendSuccess(res, user);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async getProfile(req: AuthRequest, res: Response) {
        try {
            const profile = await UserService.getProfile(req.user!.sub);
            return sendSuccess(res, profile);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async updateProfile(req: AuthRequest, res: Response) {
        try {
            const profile = await UserService.updateProfile(req.user!.sub, req.body);
            return sendSuccess(res, profile, 'Profile updated');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async getOnboardingStatus(req: AuthRequest, res: Response) {
        try {
            const profile = await UserService.getProfile(req.user!.sub);
            return sendSuccess(res, { onboardingDone: profile.onboardingDone });
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async markOnboardingDone(req: AuthRequest, res: Response) {
        try {
            const profile = await UserService.updateProfile(req.user!.sub, { onboardingDone: true });
            return sendSuccess(res, profile, 'Onboarding completed');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async updatePrivacy(req: AuthRequest, res: Response) {
        try {
            const settings = await UserService.updatePrivacy(req.user!.sub, req.body);
            return sendSuccess(res, settings, 'Privacy settings updated');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }
}
