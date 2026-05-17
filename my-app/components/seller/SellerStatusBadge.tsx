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
    approved: { label: 'Đã duyệt', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending: { label: 'Chờ duyệt', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    rejected: { label: 'Từ chối', classes: 'bg-red-50 text-red-700 border-red-200' },
    suspended: { label: 'Tạm ngưng', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
    // Order
    confirmed: { label: 'Đã xác nhận', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    processing: { label: 'Đang xử lý', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
    shipped: { label: 'Đã giao ĐVVC', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    delivered: { label: 'Đã giao', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Đã hủy', classes: 'bg-red-50 text-red-700 border-red-200' },
    // Product
    draft: { label: 'Bản nháp', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
    hidden: { label: 'Đã ẩn', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
    // Inventory
    'in-stock': { label: 'Còn hàng', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'low-stock': { label: 'Sắp hết', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    'out-of-stock': { label: 'Hết hàng', classes: 'bg-red-50 text-red-700 border-red-200' },
    // Active
    active: { label: 'Hoạt động', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive: { label: 'Không hoạt động', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
};

interface SellerStatusBadgeProps {
    status: StatusType;
    label?: string;
    size?: 'sm' | 'md';
}

export default function SellerStatusBadge({ status, label, size = 'md' }: SellerStatusBadgeProps) {
    const config = statusConfig[status] || {
        label: label || status,
        classes: 'bg-gray-100 text-gray-600 border-gray-200',
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
