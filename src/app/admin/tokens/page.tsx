'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Token {
    _id: string;
    token: string;
    clientName: string;
    clientEmail?: string;
    allowedPages: string[];
    expiresAt: string;
    isActive: boolean;
    createdAt: string;
    accessCount: number;
}

export default function TokensListPage() {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTokens();
    }, [filter]);

    const fetchTokens = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/tokens?status=${filter}`);
            const data = await res.json();
            if (data.success) {
                setTokens(data.data.tokens);
            }
        } catch (error) {
            console.error('Error fetching tokens:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/tokens/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: currentStatus ? 'deactivate' : 'activate' }),
            });
            fetchTokens();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const copyToClipboard = (token: string, allowedPages: string[]) => {
        const page = allowedPages.length > 0 ? allowedPages[0] : '';
        const url = `${window.location.origin}/t/${token}/${page}`;
        navigator.clipboard.writeText(url);
        // Could add a toast notification here
    };

    const getStatusBadge = (token: Token) => {
        const now = new Date();
        const expires = new Date(token.expiresAt);

        if (!token.isActive) {
            return <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">Inactive</span>;
        }
        if (expires <= now) {
            return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Expired</span>;
        }
        return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Active</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Access Tokens</h1>
                    <p className="text-slate-400 mt-1">Manage client access tokens</p>
                </div>
                <Link
                    href="/admin/tokens/new"
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Token
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'active', 'inactive', 'expired'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === status
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tokens Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700/50">
                            <th className="text-left text-slate-400 text-sm font-medium p-4">Client</th>
                            <th className="text-left text-slate-400 text-sm font-medium p-4">Pages</th>
                            <th className="text-left text-slate-400 text-sm font-medium p-4">Status</th>
                            <th className="text-left text-slate-400 text-sm font-medium p-4">Expires</th>
                            <th className="text-left text-slate-400 text-sm font-medium p-4">Accesses</th>
                            <th className="text-right text-slate-400 text-sm font-medium p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    Loading tokens...
                                </td>
                            </tr>
                        ) : tokens.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No tokens found
                                </td>
                            </tr>
                        ) : (
                            tokens.map((token) => (
                                <tr key={token._id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="text-white font-medium">{token.clientName}</p>
                                            {token.clientEmail && (
                                                <p className="text-slate-500 text-sm">{token.clientEmail}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {token.allowedPages.slice(0, 3).map((page) => (
                                                <span
                                                    key={page}
                                                    className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded"
                                                >
                                                    {page}
                                                </span>
                                            ))}
                                            {token.allowedPages.length > 3 && (
                                                <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">
                                                    +{token.allowedPages.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">{getStatusBadge(token)}</td>
                                    <td className="p-4 text-slate-400 text-sm">
                                        {new Date(token.expiresAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">{token.accessCount}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => copyToClipboard(token.token, token.allowedPages)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                                                title="Copy access URL"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(token._id, token.isActive)}
                                                className={`p-2 rounded-lg transition-all ${token.isActive
                                                    ? 'text-amber-400 hover:bg-amber-500/20'
                                                    : 'text-emerald-400 hover:bg-emerald-500/20'
                                                    }`}
                                                title={token.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                                        token.isActive
                                                            ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                                            : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    } />
                                                </svg>
                                            </button>
                                            <Link
                                                href={`/admin/tokens/${token._id}`}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                                                title="Edit token"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
