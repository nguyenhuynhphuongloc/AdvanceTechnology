'use client';

type StatusType =
    | 'pending' | 'approved' | 'rejected' | 'suspended'
    | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    | 'draft' | 'hidden'
    | 'in-stock' | 'low-stock' | 'out-of-stock'
    | 'active' | 'inactive'
    | string;

const statusConfig: Record<string, { label: string; classes: string }> = {
    // Shop
    approved: { label: 'Đã duyệt', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    pending: { label: 'Chờ duyệt', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    rejected: { label: 'Từ chối', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
    suspended: { label: 'Tạm ngưng', classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    // Order
    confirmed: { label: 'Đã xác nhận', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    processing: { label: 'Đang xử lý', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    shipped: { label: 'Đã giao ĐVVC', classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    delivered: { label: 'Đã giao', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled: { label: 'Đã hủy', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
    // Product
    draft: { label: 'Bản nháp', classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    hidden: { label: 'Đã ẩn', classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    // Inventory
    'in-stock': { label: 'Còn hàng', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'low-stock': { label: 'Sắp hết', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    'out-of-stock': { label: 'Hết hàng', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
    // Active
    active: { label: 'Hoạt động', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    inactive: { label: 'Không hoạt động', classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

interface SellerStatusBadgeProps {
    status: StatusType;
    label?: string;
    size?: 'sm' | 'md';
}

export default function SellerStatusBadge({ status, label, size = 'md' }: SellerStatusBadgeProps) {
    const config = statusConfig[status] || {
        label: label || status,
        classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    };

    const sizeClasses = size === 'sm'
        ? 'px-1.5 py-0.5 text-[9px]'
        : 'px-2.5 py-1 text-[10px]';

    return (
        <span className={`inline-flex items-center rounded-full border font-black uppercase tracking-wider ${sizeClasses} ${config.classes}`}>
            {label || config.label}
        </span>
    );
}
