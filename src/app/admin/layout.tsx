import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 z-40">
                <div className="p-6">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 relative flex items-center justify-center">
                            <Image
                                src="/logo-13.svg"
                                alt="Technova Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Secure Portal</h1>
                            <p className="text-xs text-slate-500">Admin Dashboard</p>
                        </div>
                    </Link>
                </div>

                <nav className="px-4 mt-4">
                    <ul className="space-y-2">
                        <li>
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/tokens"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Access Tokens
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/tokens/new"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Token
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-xs text-slate-500">Secure Portal v1.0</p>
                        <p className="text-xs text-slate-600 mt-1">TechNova Projects</p>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
