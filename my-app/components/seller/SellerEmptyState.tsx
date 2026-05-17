'use client';

interface SellerEmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function SellerEmptyState({ icon, title, description, action }: SellerEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="h-16 w-16 bg-zinc-800/60 rounded-2xl flex items-center justify-center text-zinc-600 mb-5">
                {icon || (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            {description && <p className="text-zinc-500 text-sm max-w-sm mb-6">{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
}
