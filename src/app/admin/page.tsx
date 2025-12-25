'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
    total: number;
    active: number;
    expired: number;
    inactive: number;
    expiringSoon: number;
    totalAccesses: number;
}

interface RecentToken {
    _id: string;
    clientName: string;
    createdAt: string;
    isActive: boolean;
    expiresAt: string;
    accessCount: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentTokens, setRecentTokens] = useState<RecentToken[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.data.stats);
                setRecentTokens(data.data.recentTokens);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({
        title,
        value,
        icon,
        color
    }: {
        title: string;
        value: number;
        icon: React.ReactNode;
        color: string;
    }) => (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">
                        {loading ? '—' : value.toLocaleString()}
                    </p>
                </div>
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Token access control overview</p>
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tokens"
                    value={stats?.total || 0}
                    color="bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
                    icon={
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Active Tokens"
                    value={stats?.active || 0}
                    color="bg-gradient-to-br from-emerald-500/20 to-green-500/20"
                    icon={
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats?.expiringSoon || 0}
                    color="bg-gradient-to-br from-amber-500/20 to-orange-500/20"
                    icon={
                        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Total Accesses"
                    value={stats?.totalAccesses || 0}
                    color="bg-gradient-to-br from-violet-500/20 to-purple-500/20"
                    icon={
                        <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    }
                />
            </div>

            {/* Recent Tokens */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white">Recent Tokens</h2>
                </div>
                <div className="divide-y divide-slate-700/50">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading...</div>
                    ) : recentTokens.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No tokens created yet.{' '}
                            <Link href="/admin/tokens/new" className="text-indigo-400 hover:underline">
                                Create your first token
                            </Link>
                        </div>
                    ) : (
                        recentTokens.map((token) => (
                            <Link
                                key={token._id}
                                href={`/admin/tokens/${token._id}`}
                                className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${token.isActive && new Date(token.expiresAt) > new Date()
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-500'
                                        }`} />
                                    <div>
                                        <p className="text-white font-medium">{token.clientName}</p>
                                        <p className="text-slate-500 text-sm">
                                            Created {new Date(token.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-sm">
                                        {token.accessCount} access{token.accessCount !== 1 ? 'es' : ''}
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        Expires {new Date(token.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
                {recentTokens.length > 0 && (
                    <div className="p-4 border-t border-slate-700/50">
                        <Link
                            href="/admin/tokens"
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                        >
                            View all tokens →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
