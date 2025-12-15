export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  stock: number;
  imageUrl: string;
  videoUrl?: string; // Short vertical video
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id?: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'YAPE' | 'PLIN';
  status?: OrderStatus;
  date?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}