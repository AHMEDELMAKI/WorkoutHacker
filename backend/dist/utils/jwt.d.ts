export interface AccessTokenPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare function signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string;
export declare function verifyAccessToken(token: string): AccessTokenPayload;
export declare function createRefreshToken(userId: string): Promise<string>;
export declare function rotateRefreshToken(oldToken: string): Promise<{
    userId: string;
    newRefreshToken: string;
}>;
export declare function revokeAllUserTokens(userId: string): Promise<void>;
//# sourceMappingURL=jwt.d.ts.map