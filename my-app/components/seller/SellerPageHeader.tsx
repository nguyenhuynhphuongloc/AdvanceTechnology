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
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                )}
                <div>
                    <h1 className="text-3xl font-black tracking-tight leading-tight">{title}</h1>
                    {subtitle && <p className="text-zinc-500 text-sm mt-1 font-medium">{subtitle}</p>}
                </div>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}
