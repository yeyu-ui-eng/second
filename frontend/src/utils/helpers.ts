export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'badge-blue',
    CONFIRMED: 'badge-purple',
    IN_PRODUCTION: 'badge-yellow',
    READY: 'badge-green',
    DELIVERED: 'badge-green',
    CANCELLED: 'badge-red',
    PENDING: 'badge-yellow',
    PARTIAL: 'badge-blue',
    PAID: 'badge-green',
    REFUNDED: 'badge-red',
    WAITING: 'badge-gray',
    ASSIGNED: 'badge-blue',
    CUTTING: 'badge-yellow',
    SEWING: 'badge-yellow',
    QUALITY_CHECK: 'badge-purple',
    PACKAGING: 'badge-blue',
  };
  return colors[status] || 'badge-gray';
}
