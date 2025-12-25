'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string;
}

export default function CreateTokenPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [availablePages, setAvailablePages] = useState<Project[]>([]);
    const [createdToken, setCreatedToken] = useState<string | null>(null);

    // Initial fetch of projects
    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAvailablePages(data.data);
                }
            })
            .catch(err => console.error('Failed to fetch projects', err))
            .finally(() => setProjectsLoading(false));
    }, []);

    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        allowedPages: [] as string[],
        allowedDomains: '', // Comma separated string for input
        expirationDays: '30',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Process domains: split by comma and trim
            const domainsList = formData.allowedDomains
                .split(',')
                .map(d => d.trim())
                .filter(d => d.length > 0);

            const res = await fetch('/api/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    allowedDomains: domainsList,
                    expirationDays: parseInt(formData.expirationDays),
                }),
            });

            const data = await res.json();

            if (data.success) {
                setCreatedToken(data.data.token.token);
            } else {
                alert(data.error || 'Failed to create token');
            }
        } catch (error) {
            console.error('Error creating token:', error);
            alert('Failed to create token');
        } finally {
            setLoading(false);
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

    const selectAllPages = () => {
        setFormData(prev => ({
            ...prev,
            allowedPages: availablePages.map(p => p.id),
        }));
    };

    const copyAccessUrl = () => {
        // Construct smart URL
        let domain = window.location.host;
        const enteredDomains = formData.allowedDomains.split(',').map(d => d.trim()).filter(d => d.length > 0);

        if (enteredDomains.length === 1) {
            domain = enteredDomains[0];
        }

        // Add protocol if missing
        const protocol = window.location.protocol;
        const items = formData.allowedPages;
        const pagePart = items.length === 1 ? `/${items[0]}` : '/[project]';

        const url = `${protocol}//${domain}/t/${createdToken}${pagePart}`;
        navigator.clipboard.writeText(url);
    };

    if (createdToken) {
        // Determine display URL for success screen
        let displayDomain = typeof window !== 'undefined' ? window.location.host : '';
        const enteredDomains = formData.allowedDomains.split(',').map(d => d.trim()).filter(d => d.length > 0);
        if (enteredDomains.length === 1) {
            displayDomain = enteredDomains[0];
        }

        const items = formData.allowedPages;
        const pagePart = items.length === 1 ? `/${items[0]}` : '/[project]';

        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Token Created Successfully</h2>
                        <p className="text-slate-400 mb-8">Share the access URL with your client</p>

                        <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                            <p className="text-xs text-slate-500 mb-2">Access URL</p>
                            <code className="text-indigo-400 text-sm break-all">
                                {typeof window !== 'undefined' ? window.location.protocol : 'http:'}//{displayDomain}/t/{createdToken}{pagePart}
                            </code>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={copyAccessUrl}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy URL
                            </button>
                            <Link
                                href="/admin/tokens"
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                            >
                                View All Tokens
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/tokens" className="text-slate-400 hover:text-white text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to tokens
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-white mb-8">Create Access Token</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Info */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Client Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Client Name *</label>
                            <input
                                type="text"
                                value={formData.clientName}
                                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Enter client or organization name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Client Email (optional)</label>
                            <input
                                type="email"
                                value={formData.clientEmail}
                                onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="client@example.com"
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
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Allowed Projects *</h2>
                        <button
                            type="button"
                            onClick={selectAllPages}
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                            Select all
                        </button>
                    </div>

                    {projectsLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading projects...</div>
                    ) : availablePages.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No projects found in directory.</div>
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

                {/* Expiration */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Expiration</h2>

                    <div className="grid grid-cols-4 gap-3">
                        {['7', '30', '90', '365'].map((days) => (
                            <button
                                key={days}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, expirationDays: days }))}
                                className={`p-3 rounded-xl text-center transition-all ${formData.expirationDays === days
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                <p className="text-lg font-bold">{days}</p>
                                <p className="text-xs">days</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Notes (optional)</h2>

                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                        placeholder="Internal notes about this token..."
                        rows={3}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || formData.allowedPages.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating...' : 'Create Access Token'}
                </button>
            </form>
        </div>
    );
}
