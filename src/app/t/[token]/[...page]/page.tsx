import { validateToken } from '@/lib/middleware/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';

interface PageProps {
    params: Promise<{
        token: string;
        page: string[];
    }>;
}

export default async function ProtectedPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { token, page } = resolvedParams;
    const pageName = page[0] || '';

    // Get client info for logging
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || undefined;

    // Validate the token
    const result = await validateToken(token, pageName, { ip, userAgent });

    if (!result.valid) {
        // Redirect to access restricted page with reason
        redirect(`/access-restricted?reason=${result.reason}`);
    }

    // Try to load the protected HTML content
    const htmlFileName = `${pageName}.html`;
    const protectedPath = path.join(process.cwd(), '..', htmlFileName);

    let htmlContent = '';

    try {
        // Read from parent directory where original HTML files are
        if (fs.existsSync(protectedPath)) {
            htmlContent = fs.readFileSync(protectedPath, 'utf-8');
        } else {
            // Try protected-content folder
            const altPath = path.join(process.cwd(), 'protected-content', htmlFileName);
            if (fs.existsSync(altPath)) {
                htmlContent = fs.readFileSync(altPath, 'utf-8');
            } else {
                redirect('/access-restricted?reason=PAGE_NOT_FOUND');
            }
        }
    } catch (error) {
        console.error('Error loading protected content:', error);
        redirect('/access-restricted?reason=PAGE_NOT_FOUND');
    }

    return (
        <div className="min-h-screen">
            {/* Inject the HTML content */}
            <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="protected-content"
            />
        </div>
    );
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    const pageName = resolvedParams.page[0] || 'Protected';

    return {
        title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - Secure Access`,
        robots: 'noindex, nofollow', // Prevent search engine indexing
    };
}
