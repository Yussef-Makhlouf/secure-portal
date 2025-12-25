import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import Token from '@/lib/models/token';

export const dynamic = 'force-dynamic';

// GET - Dashboard statistics
export async function GET() {
    try {
        await connectToDatabase();

        const now = new Date();

        const [
            totalTokens,
            activeTokens,
            expiredTokens,
            inactiveTokens,
            recentTokens,
            totalAccesses,
            recentAccesses,
        ] = await Promise.all([
            Token.countDocuments({}),
            Token.countDocuments({ isActive: true, expiresAt: { $gt: now } }),
            Token.countDocuments({ expiresAt: { $lte: now } }),
            Token.countDocuments({ isActive: false }),
            Token.find({})
                .select('clientName createdAt isActive expiresAt accessCount')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Token.aggregate([
                { $group: { _id: null, total: { $sum: '$accessCount' } } }
            ]),
            Token.find({ lastAccessedAt: { $exists: true } })
                .select('clientName lastAccessedAt accessCount')
                .sort({ lastAccessedAt: -1 })
                .limit(5)
                .lean(),
        ]);

        // Tokens expiring soon (within 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const expiringSoon = await Token.countDocuments({
            isActive: true,
            expiresAt: { $gt: now, $lte: sevenDaysFromNow },
        });

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    total: totalTokens,
                    active: activeTokens,
                    expired: expiredTokens,
                    inactive: inactiveTokens,
                    expiringSoon,
                    totalAccesses: totalAccesses[0]?.total || 0,
                },
                recentTokens,
                recentAccesses,
            },
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
