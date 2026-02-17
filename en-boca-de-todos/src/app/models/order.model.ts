import { OrderItem } from './order-item.model';

export interface Order {
  id: string;
  sequential: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: Date;
  status: 'pending' | 'sent' | 'paid';
}