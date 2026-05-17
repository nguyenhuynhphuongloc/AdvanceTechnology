'use client';

interface SellerActionBarProps {
    search?: {
        value: string;
        onChange: (v: string) => void;
        placeholder?: string;
    };
    filters?: React.ReactNode;
    actions?: React.ReactNode;
}

export default function SellerActionBar({ search, filters, actions }: SellerActionBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            {search && (
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search.value}
                        onChange={(e) => search.onChange(e.target.value)}
                        placeholder={search.placeholder || 'Search...'}
                        className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                </div>
            )}
            {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
            {actions && <div className="ml-auto flex-shrink-0">{actions}</div>}
        </div>
    );
}
