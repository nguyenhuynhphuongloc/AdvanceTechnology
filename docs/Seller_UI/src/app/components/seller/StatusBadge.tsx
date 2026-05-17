import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: string;
  type?: 'shop' | 'product' | 'order' | 'payment';
}

export function StatusBadge({ status, type = 'product' }: StatusBadgeProps) {
  const variants: Record<string, { variant: any; label: string }> = {
    // Shop statuses
    pending: { variant: 'secondary', label: 'Pending' },
    approved: { variant: 'default', label: 'Approved' },
    rejected: { variant: 'destructive', label: 'Rejected' },
    suspended: { variant: 'destructive', label: 'Suspended' },

    // Product statuses
    draft: { variant: 'outline', label: 'Draft' },
    active: { variant: 'default', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },

    // Order statuses
    processing: { variant: 'secondary', label: 'Processing' },
    shipped: { variant: 'default', label: 'Shipped' },
    delivered: { variant: 'default', label: 'Delivered' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },

    // Payment statuses
    paid: { variant: 'default', label: 'Paid' },
    failed: { variant: 'destructive', label: 'Failed' },
    refunded: { variant: 'secondary', label: 'Refunded' },
  };

  const config = variants[status.toLowerCase()] || { variant: 'outline', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
