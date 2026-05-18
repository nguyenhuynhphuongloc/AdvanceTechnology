'use client';

interface SellerEmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function SellerEmptyState({ icon, title, description, action }: SellerEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
                {icon || (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">{title}</h3>
            {description && <p className="text-gray-500 text-sm max-w-sm mb-5">{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
}
