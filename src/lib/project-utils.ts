import fs from 'fs';
import path from 'path';

export interface ProjectInfo {
    id: string;
    name: string;
    description: string;
    htmlPath: string; // Relative path to HTML file
}

/**
 * Scans the project root directory for folders containing HTML files.
 * Convention: A folder {project}/ containing {project}.html or {project}/index.html
 */
export async function getAvailableProjects(): Promise<ProjectInfo[]> {
    const rootDir = process.cwd();
    // Use the parent directory of 'src' if we are in 'src', but process.cwd() is usually project root.
    // Assuming structure: e:\...\secure-portal\fainew\fainew.html
    // And process.cwd() is e:\...\secure-portal

    const entries = await fs.promises.readdir(rootDir, { withFileTypes: true });

    const projects: ProjectInfo[] = [];

    // Directories to ignore
    const ignoreDirs = ['node_modules', '.next', '.git', 'src', 'public', 'protected-content'];

    for (const entry of entries) {
        if (entry.isDirectory() && !ignoreDirs.includes(entry.name) && !entry.name.startsWith('.')) {
            const dirPath = path.join(rootDir, entry.name);

            // Optimization: Only check for specific files instead of reading whole dir
            // Check for {folderName}.html
            const specificHtmlPath = path.join(dirPath, `${entry.name}.html`);
            const indexHtmlPath = path.join(dirPath, 'index.html');

            let htmlRelativePath = '';

            try {
                if (fs.existsSync(specificHtmlPath)) {
                    htmlRelativePath = path.join(entry.name, `${entry.name}.html`);
                } else if (fs.existsSync(indexHtmlPath)) {
                    htmlRelativePath = path.join(entry.name, 'index.html');
                }

                if (htmlRelativePath) {
                    projects.push({
                        id: entry.name,
                        name: formatProjectName(entry.name),
                        description: `Project ${formatProjectName(entry.name)}`,
                        htmlPath: htmlRelativePath
                    });
                }
            } catch (err) {
                // Ignore permission errors etc.
                console.warn(`Error scanning directory ${entry.name}:`, err);
            }
        }
    }

    return projects;
}

function formatProjectName(id: string): string {
    return id.charAt(0).toUpperCase() + id.slice(1);
}
