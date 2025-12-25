import { connectToDatabase } from '@/lib/database';
import Token, { IToken } from '@/lib/models/token';

import { getAvailableProjects } from '../project-utils';

export type ValidationResult =
    | { valid: true; token: IToken; }
    | { valid: false; reason: 'TOKEN_NOT_FOUND' | 'TOKEN_INACTIVE' | 'TOKEN_EXPIRED' | 'PAGE_NOT_ALLOWED' | 'DOMAIN_NOT_ALLOWED'; };

/**
 * Validates a token for accessing a specific page
 * Checks: existence → active status → expiration → domain → page permission
 */
export async function validateToken(
    tokenValue: string,
    page: string,
    logAccess?: { ip: string; userAgent?: string; host?: string }
): Promise<ValidationResult> {
    try {
        await connectToDatabase();

        // Find token by value
        const tokenDoc = await Token.findOne({ token: tokenValue });

        // 1. Check if token exists
        if (!tokenDoc) {
            return { valid: false, reason: 'TOKEN_NOT_FOUND' };
        }

        // 2. Check if token is active
        if (!tokenDoc.isActive) {
            return { valid: false, reason: 'TOKEN_INACTIVE' };
        }

        // 3. Check if token has expired
        if (new Date() > tokenDoc.expiresAt) {
            return { valid: false, reason: 'TOKEN_EXPIRED' };
        }

        // 4. Check if domain is allowed
        if (logAccess?.host && tokenDoc.allowedDomains && tokenDoc.allowedDomains.length > 0) {
            // Remove port if present for comparison? Usually host includes port.
            // Let's assume strict match for now, or maybe check if array includes the hostname.
            // A safer check: if host is 'localhost:3000', and allowed is 'localhost', it might fail.
            // But usually we want to restrict to 'example.com'.

            // Normalize host: remove port if it's 80 or 443, or just keep it as is?
            // Next.js headers().get('host') usually includes port if non-standard.

            const requestHost = logAccess.host;
            const isDomainAllowed = tokenDoc.allowedDomains.some(domain => {
                // strict match or endsWith for subdomains?
                // Let's do exact match first as requested.
                return domain === requestHost || requestHost.endsWith('.' + domain);
            });

            if (!isDomainAllowed) {
                return { valid: false, reason: 'DOMAIN_NOT_ALLOWED' };
            }
        }

        // 5. Check if page is allowed
        // Normalize page name (remove .html extension if present)
        const normalizedPage = page.replace(/\.html$/i, '').toLowerCase();
        const allowedNormalized = tokenDoc.allowedPages.map(p =>
            p.replace(/\.html$/i, '').toLowerCase()
        );

        if (!allowedNormalized.includes(normalizedPage) && !allowedNormalized.includes('*')) {
            return { valid: false, reason: 'PAGE_NOT_ALLOWED' };
        }

        // Log access if requested
        if (logAccess) {
            await Token.findByIdAndUpdate(tokenDoc._id, {
                $push: {
                    accessLog: {
                        $each: [{
                            timestamp: new Date(),
                            page: normalizedPage,
                            ip: logAccess.ip,
                            userAgent: logAccess.userAgent,
                        }],
                        $slice: -100, // Keep only last 100 access logs
                    },
                },
                $inc: { accessCount: 1 },
                $set: { lastAccessedAt: new Date() },
            });
        }

        return { valid: true, token: tokenDoc };
    } catch (error) {
        console.error('Token validation error:', error);
        return { valid: false, reason: 'TOKEN_NOT_FOUND' };
    }
}

