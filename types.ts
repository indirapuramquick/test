
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Customer {
  id: string; // UUID
  name: string;
  phone: string; // 10-digit numeric string, primary key conceptually
  address: string;
}

export interface OrderItem {
  menuItemId: string;
  nameAtOrder: string;
  quantity: number;
  priceAtOrder: number;
}

export enum OrderType {
  TAKEAWAY = "Takeaway",
  DELIVERY = "Delivery",
}

export interface Order {
  id: string; // UUID, also Invoice No.
  customerId: string; // Links to Customer.id
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderType: OrderType;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string; // ISO string date
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
}
