import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import Token from '@/lib/models/token';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
// Generate a secure 64-character token
function generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const randomBytes = new Uint8Array(64);

    if (typeof crypto !== 'undefined') {
        crypto.getRandomValues(randomBytes);
    } else {
        for (let i = 0; i < 64; i++) {
            randomBytes[i] = Math.floor(Math.random() * 256);
        }
    }

    for (let i = 0; i < 64; i++) {
        token += chars[randomBytes[i] % chars.length];
    }
    return token;
}

// GET - List all tokens
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status'); // 'active', 'inactive', 'expired', 'all'

        const query: Record<string, unknown> = {};

        if (status === 'active') {
            query.isActive = true;
            query.expiresAt = { $gt: new Date() };
        } else if (status === 'inactive') {
            query.isActive = false;
        } else if (status === 'expired') {
            query.expiresAt = { $lte: new Date() };
        }

        const skip = (page - 1) * limit;

        const [tokens, total] = await Promise.all([
            Token.find(query)
                .select('-accessLog') // Exclude access logs from list
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Token.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                tokens,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching tokens:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tokens' },
            { status: 500 }
        );
    }
}

// POST - Create new token
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const {
            clientName,
            clientEmail,
            allowedPages,
            allowedDomains,
            expirationDays,
            expiresAt,
            notes,
        } = body;

        // Validation
        if (!clientName) {
            return NextResponse.json(
                { success: false, error: 'Client name is required' },
                { status: 400 }
            );
        }

        if (!allowedPages || !Array.isArray(allowedPages) || allowedPages.length === 0) {
            return NextResponse.json(
                { success: false, error: 'At least one allowed page is required' },
                { status: 400 }
            );
        }

        // Calculate expiration date
        let expiration: Date;
        if (expiresAt) {
            expiration = new Date(expiresAt);
        } else if (expirationDays) {
            expiration = new Date();
            expiration.setDate(expiration.getDate() + parseInt(expirationDays));
        } else {
            // Default to 30 days
            expiration = new Date();
            expiration.setDate(expiration.getDate() + 30);
        }

        // Generate unique token
        const token = generateSecureToken();

        const newToken = await Token.create({
            token,
            clientName,
            clientEmail,
            allowedPages,
            allowedDomains,
            expiresAt: expiration,
            isActive: true,
            notes,
        });

        return NextResponse.json({
            success: true,
            data: {
                token: newToken,
                accessUrl: `/t/${token}`,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating token:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create token' },
            { status: 500 }
        );
    }
}
