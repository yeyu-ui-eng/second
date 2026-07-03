export function generateOrderNumber(): string {
  const prefix = 'ORD';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculatePagination(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take, page, limit };
}

export function parseDateRange(startDate?: string, endDate?: string) {
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  if (endDate) end.setHours(23, 59, 59, 999);
  return { start, end };
}
