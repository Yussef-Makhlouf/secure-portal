'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string;
}

interface Token {
    _id: string;
    token: string;
    clientName: string;
    clientEmail?: string;
    allowedPages: string[];
    allowedDomains: string[];
    expiresAt: string;
    isActive: boolean;
    createdAt: string;
    accessCount: number;
    accessLog?: Array<{
        timestamp: string;
        page: string;
        ip: string;
        userAgent?: string;
    }>;
    notes?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditTokenPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [token, setToken] = useState<Token | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Projects state
    const [availablePages, setAvailablePages] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);

    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        allowedPages: [] as string[],
        allowedDomains: '',
        isActive: true,
        notes: '',
    });

    useEffect(() => {
        // Fetch projects first or in parallel
        const loadData = async () => {
            try {
                // Fetch Projects
                const projectsRes = await fetch('/api/projects');
                const projectsData = await projectsRes.json();
                if (projectsData.success) {
                    setAvailablePages(projectsData.data);
                }
            } catch (err) {
                console.error('Failed to fetch projects', err);
            } finally {
                setProjectsLoading(false);
            }

            // Fetch Token
            fetchToken();
        };

        loadData();
    }, [resolvedParams.id]);

    const fetchToken = async () => {
        try {
            const res = await fetch(`/api/tokens/${resolvedParams.id}`);
            const data = await res.json();
            if (data.success) {
                setToken(data.data);
                setFormData({
                    clientName: data.data.clientName,
                    clientEmail: data.data.clientEmail || '',
                    allowedPages: data.data.allowedPages,
                    allowedDomains: data.data.allowedDomains ? data.data.allowedDomains.join(', ') : '',
                    isActive: data.data.isActive,
                    notes: data.data.notes || '',
                });
            }
        } catch (error) {
            console.error('Error fetching token:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Process domains: split by comma and trim
            const domainsList = formData.allowedDomains
                .split(',')
                .map(d => d.trim())
                .filter(d => d.length > 0);

            const res = await fetch(`/api/tokens/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    allowedDomains: domainsList
                }),
            });

            const data = await res.json();
            if (data.success) {
                router.push('/admin/tokens');
            } else {
                alert(data.error || 'Failed to update token');
            }
        } catch (error) {
            console.error('Error updating token:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/tokens/${resolvedParams.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (data.success) {
                router.push('/admin/tokens');
            }
        } catch (error) {
            console.error('Error deleting token:', error);
        }
    };

    const togglePage = (pageId: string) => {
        setFormData(prev => ({
            ...prev,
            allowedPages: prev.allowedPages.includes(pageId)
                ? prev.allowedPages.filter(p => p !== pageId)
                : [...prev.allowedPages, pageId],
        }));
    };

    const copyAccessUrl = () => {
        if (token) {
            // Construct smart URL based on domains
            let domain = window.location.host;
            if (token.allowedDomains && token.allowedDomains.length === 1) {
                domain = token.allowedDomains[0];
            }

            const protocol = window.location.protocol;
            const items = token.allowedPages;
            const pagePart = items.length === 1 ? `/${items[0]}` : '';

            const url = `${protocol}//${domain}/t/${token.token}${pagePart}`;
            navigator.clipboard.writeText(url);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Token not found</p>
                <Link href="/admin/tokens" className="text-indigo-400 hover:underline mt-4 inline-block">
                    Back to tokens
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/tokens" className="text-slate-400 hover:text-white text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to tokens
                </Link>
            </div>

            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Token</h1>
                    <p className="text-slate-400 mt-1">Manage access for {token.clientName}</p>
                </div>
                <button
                    onClick={copyAccessUrl}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy URL
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Client Info */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Client Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Client Name</label>
                                    <input
                                        type="text"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Client Email</label>
                                    <input
                                        type="email"
                                        value={formData.clientEmail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Domain Restriction */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Domain Restriction</h2>
                            <p className="text-sm text-slate-400 mb-4">
                                Leave empty to allow access from any domain. Enter specific domains (e.g. <code>example.com</code>) to restrict access.
                            </p>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Allowed Domains (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.allowedDomains}
                                    onChange={(e) => setFormData(prev => ({ ...prev, allowedDomains: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="e.g. mysite.com, portal.company.com"
                                />
                            </div>
                        </div>

                        {/* Allowed Pages */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Allowed Projects</h2>

                            {projectsLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading projects...</div>
                            ) : availablePages.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No projects found.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availablePages.map((page) => (
                                        <label
                                            key={page.id}
                                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.allowedPages.includes(page.id)
                                                ? 'border-indigo-500 bg-indigo-500/10'
                                                : 'border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.allowedPages.includes(page.id)}
                                                onChange={() => togglePage(page.id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.allowedPages.includes(page.id)
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : 'border-slate-600'
                                                }`}>
                                                {formData.allowedPages.includes(page.id) && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{page.name}</p>
                                                <p className="text-slate-500 text-xs">{page.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status & Notes */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Status & Notes</h2>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-emerald-600' : 'bg-slate-600'
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? 'left-7' : 'left-1'
                                                }`}
                                        />
                                    </div>
                                    <span className="text-white">Token Active</span>
                                </label>

                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                                    placeholder="Internal notes..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-6 py-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar - Token Info & Logs */}
                <div className="space-y-6">
                    {/* Token Info */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Token Info</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500">Status</p>
                                <p className={`font-medium ${token.isActive && new Date(token.expiresAt) > new Date()
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                    }`}>
                                    {token.isActive && new Date(token.expiresAt) > new Date() ? 'Active' : 'Inactive/Expired'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Created</p>
                                <p className="text-white">{new Date(token.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Expires</p>
                                <p className="text-white">{new Date(token.expiresAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Accesses</p>
                                <p className="text-white text-2xl font-bold">{token.accessCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Access Log */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recent Access</h3>

                        {token.accessLog && token.accessLog.length > 0 ? (
                            <div className="space-y-3">
                                {token.accessLog.slice(-5).reverse().map((log, i) => (
                                    <div key={i} className="text-sm">
                                        <p className="text-white">{log.page}</p>
                                        <p className="text-slate-500 text-xs">
                                            {new Date(log.timestamp).toLocaleString()} • {log.ip}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">No access logs yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Token?</h3>
                        <p className="text-slate-400 mb-6">
                            This will permanently revoke access for {token.clientName}. This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 bg-slate-700 text-white rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
