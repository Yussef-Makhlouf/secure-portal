import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import Token from '@/lib/models/token';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get single token with full details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const token = await Token.findById(id).lean();

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Token not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: token,
        });
    } catch (error) {
        console.error('Error fetching token:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch token' },
            { status: 500 }
        );
    }
}

// PUT - Update token
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        const {
            clientName,
            clientEmail,
 
            allowedPages,
            allowedDomains,
            expiresAt,
            isActive,
            notes,
        } = body;

        const updateData: Record<string, unknown> = {};

        if (clientName !== undefined) updateData.clientName = clientName;
        if (clientEmail !== undefined) updateData.clientEmail = clientEmail;
        if (clientEmail !== undefined) updateData.clientEmail = clientEmail;
        if (allowedPages !== undefined) updateData.allowedPages = allowedPages;
        if (allowedDomains !== undefined) updateData.allowedDomains = allowedDomains;
        if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
        if (isActive !== undefined) updateData.isActive = isActive;
        if (notes !== undefined) updateData.notes = notes;

        const token = await Token.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Token not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: token,
        });
    } catch (error) {
        console.error('Error updating token:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update token' },
            { status: 500 }
        );
    }
}

// DELETE - Delete token
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const token = await Token.findByIdAndDelete(id);

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Token not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Token deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting token:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete token' },
            { status: 500 }
        );
    }
}

// PATCH - Quick actions (activate/deactivate)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        let updateData: Record<string, unknown> = {};

        switch (action) {
            case 'activate':
                updateData = { isActive: true };
                break;
            case 'deactivate':
                updateData = { isActive: false };
                break;
            case 'extend':
                const { days } = body;
                const token = await Token.findById(id);
                if (token) {
                    const newExpiry = new Date(token.expiresAt);
                    newExpiry.setDate(newExpiry.getDate() + (days || 30));
                    updateData = { expiresAt: newExpiry };
                }
                break;
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }

        const updatedToken = await Token.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!updatedToken) {
            return NextResponse.json(
                { success: false, error: 'Token not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedToken,
        });
    } catch (error) {
        console.error('Error performing action:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to perform action' },
            { status: 500 }
        );
    }
}
