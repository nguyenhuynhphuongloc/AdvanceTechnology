'use client';

import Link from 'next/link';

interface SellerPageHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string;
    action?: React.ReactNode;
}

export default function SellerPageHeader({ title, subtitle, backHref, action }: SellerPageHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
                {backHref && (
                    <Link
                        href={backHref}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all flex-shrink-0 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">{title}</h1>
                    {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}
