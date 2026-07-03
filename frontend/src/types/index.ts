export type UserRole = 'ADMIN' | 'SALES' | 'PRODUCTION';

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY' | 'DELIVERED' | 'CANCELLED';

export type ProductionStage = 'WAITING' | 'ASSIGNED' | 'CUTTING' | 'SEWING' | 'QUALITY_CHECK' | 'PACKAGING' | 'READY' | 'DELIVERED';

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category?: string;
  price: number;
  cost: number;
  sizes?: string;
  colors?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  _count?: { orders: number };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  userId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  dueDate?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  customer: Customer;
  user: User;
  product: Product;
  productionTasks: ProductionTask[];
  attachments: Attachment[];
}

export interface ProductionTask {
  id: string;
  orderId: string;
  assignedTo: string;
  stage: ProductionStage;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  delayReason?: string;
  createdAt: string;
  order: Order;
  assignedUser: User;
}

export interface Attachment {
  id: string;
  orderId: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
