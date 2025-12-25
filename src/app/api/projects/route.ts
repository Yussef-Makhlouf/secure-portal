import { NextResponse } from 'next/server';
import { getAvailableProjects } from '@/lib/project-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const projects = await getAvailableProjects();
        return NextResponse.json({
            success: true,
            data: projects,
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
