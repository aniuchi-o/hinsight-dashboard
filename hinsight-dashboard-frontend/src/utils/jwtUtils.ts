import { IJWTClaims } from '../types/auth.types';

/**
 * Decode a JWT payload without verifying the signature.
 * Signature verification happens server-side on every request.
 */
export function decodeJWT(token: string): IJWTClaims | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(payload));
        return decoded as IJWTClaims;
    } catch {
        return null;
    }
}

/**
 * Returns true if the token is expired or will expire within the buffer window.
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
    const claims = decodeJWT(token);
    if (!claims) return true;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return claims.exp < nowSeconds + bufferSeconds;
}

/**
 * Calculate session duration in minutes from the JWT `iat` claim.
 */
export function getSessionDuration(token: string): number {
    const claims = decodeJWT(token);
    if (!claims) return 0;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return Math.floor((nowSeconds - claims.iat) / 60);
}
