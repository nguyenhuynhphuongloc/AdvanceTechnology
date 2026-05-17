type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'awaiting_payment' | 'paid' | 'partially_shipped' | 'refunded';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:           { label: 'Pending',           bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400' },
  awaiting_payment:  { label: 'Awaiting Payment',  bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400' },
  processing:       { label: 'Processing',         bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  confirmed:        { label: 'Confirmed',          bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  paid:             { label: 'Paid',               bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-400' },
  partially_shipped:{ label: 'Partially Shipped', bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400' },
  shipped:          { label: 'Shipped',            bg: 'bg-indigo-50',  text: 'text-indigo-700',dot: 'bg-indigo-400' },
  delivered:        { label: 'Delivered',          bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  cancelled:        { label: 'Cancelled',           bg: 'bg-red-50',     text: 'text-red-700',   dot: 'bg-red-400' },
  refunded:         { label: 'Refunded',            bg: 'bg-gray-100',   text: 'text-gray-700',  dot: 'bg-gray-400' },
};

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
