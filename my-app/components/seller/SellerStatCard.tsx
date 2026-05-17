'use client';

interface SellerStatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    accent?: 'default' | 'green' | 'red' | 'blue' | 'orange';
    subtitle?: string;
}

const accentMap = {
    default: { bg: 'bg-zinc-800/60', icon: 'text-zinc-400', border: 'border-zinc-700/50' },
    green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    red: { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-red-500/20' },
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', border: 'border-orange-500/20' },
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
        <div className={`bg-zinc-900/60 border ${styles.border} rounded-2xl p-6`}>
            <div className={`h-11 w-11 rounded-xl ${styles.bg} flex items-center justify-center mb-5`}>
                <div className={styles.icon}>{icon}</div>
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black tracking-tight">{value}</p>
            {subtitle && <p className="text-zinc-600 text-xs mt-1">{subtitle}</p>}
        </div>
    );
}
