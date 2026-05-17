'use client';

interface SellerStatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    accent?: 'default' | 'green' | 'red' | 'blue' | 'orange';
    subtitle?: string;
}

const accentMap = {
    default: { bg: 'bg-gray-100', icon: 'text-gray-500', border: 'border-gray-200' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100' },
};

export default function SellerStatCard({
    label,
    value,
    icon,
    accent = 'default',
    subtitle,
}: SellerStatCardProps) {
    const styles = accentMap[accent];

    return (
        <div className={`bg-white border ${styles.border} rounded-xl p-5 shadow-sm`}>
            <div className={`h-10 w-10 rounded-lg ${styles.bg} flex items-center justify-center mb-4`}>
                <div className={styles.icon}>{icon}</div>
            </div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black tracking-tight text-gray-900">{value}</p>
            {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
    );
}
