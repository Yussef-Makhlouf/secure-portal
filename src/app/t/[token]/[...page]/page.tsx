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
    const host = headersList.get('host') || undefined;

    // Validate the token
    const result = await validateToken(token, pageName, { ip, userAgent, host });

    if (!result.valid) {
        // Redirect to access restricted page with reason
        redirect(`/access-restricted?reason=${result.reason}`);
    }

    // Try to load the protected HTML content
    // Priority:
    // 1. {project}/{project}.html (e.g. fainew/fainew.html)
    // 2. {project}/index.html
    // 3. protected-content/{project}.html (legacy fallback)

    let htmlContent = '';
    const rootDir = process.cwd();

    // Check dynamic project paths
    const projectPath = path.join(rootDir, pageName);
    const specificHtmlPath = path.join(projectPath, `${pageName}.html`);
    const indexHtmlPath = path.join(projectPath, 'index.html');
    const legacyPath = path.join(rootDir, 'protected-content', `${pageName}.html`);
    const fallbackPath = path.join(rootDir, '..', `${pageName}.html`); // Check parent dir just in case

    try {
        if (fs.existsSync(specificHtmlPath)) {
            htmlContent = fs.readFileSync(specificHtmlPath, 'utf-8');
        } else if (fs.existsSync(indexHtmlPath)) {
            htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
        } else if (fs.existsSync(legacyPath)) {
            htmlContent = fs.readFileSync(legacyPath, 'utf-8');
        } else if (fs.existsSync(fallbackPath)) {
            htmlContent = fs.readFileSync(fallbackPath, 'utf-8');
        } else {
            console.error(`Project content not found for: ${pageName}`);
            redirect('/access-restricted?reason=PAGE_NOT_FOUND');
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
