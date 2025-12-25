'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';

const reasonMessages: Record<string, { title: string; description: string }> = {
    TOKEN_NOT_FOUND: {
        title: 'Access Link Invalid',
        description: 'The access link you used is not recognized. Please contact your administrator for a valid access link.',
    },
    TOKEN_INACTIVE: {
        title: 'Access Revoked',
        description: 'Your access to this content has been revoked. Please contact your administrator if you believe this is an error.',
    },
    TOKEN_EXPIRED: {
        title: 'Access Expired',
        description: 'Your access link has expired. Please contact your administrator to request renewed access.',
    },
    PAGE_NOT_ALLOWED: {
        title: 'Page Not Authorized',
        description: 'Your current access level does not include permission to view this page. Please contact your administrator for assistance.',
    },
    PAGE_NOT_FOUND: {
        title: 'Content Unavailable',
        description: 'The requested content could not be found. Please verify the link and try again.',
    },
    DEFAULT: {
        title: 'Access Restricted',
        description: 'You do not have permission to access this content. Please use a valid access link provided by your administrator.',
    },
};

function AccessRestrictedContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason') || 'DEFAULT';
    const message = reasonMessages[reason] || reasonMessages.DEFAULT;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            {/* Main card */}
            <div className="relative z-10 max-w-md w-full">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-8 md:p-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 relative flex items-center justify-center">
                            <Image
                                src="/logo-13.svg"
                                alt="Technova Logo"
                                width={96}
                                height={96}
                                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
                        {message.title}
                    </h1>

                    {/* Description */}
                    <p className="text-slate-400 text-center leading-relaxed mb-8">
                        {message.description}
                    </p>

                    {/* Divider */}
                    <div className="border-t border-slate-700/50 my-6" />

                    {/* Help section */}
                    <div className="text-center">
                        <p className="text-sm text-slate-500 mb-4">
                            Need assistance?
                        </p>
                        <a
                            href="mailto:support@technova.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Support
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    Secure Portal • TechNova Projects
                </p>
            </div>
        </div>
    );
}

export default function AccessRestrictedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-pulse text-slate-500">Loading...</div>
            </div>
        }>
            <AccessRestrictedContent />
        </Suspense>
    );
}
