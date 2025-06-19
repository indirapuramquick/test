
import { MenuItem, Customer, Order } from '../types';
import { INITIAL_MENU_ITEMS, LOCAL_STORAGE_KEYS } from '../constants';

// --- UUID Generator ---
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// --- Menu Items ---
export const getMenuItems = (): MenuItem[] => {
  const items = localStorage.getItem(LOCAL_STORAGE_KEYS.MENU_ITEMS);
  return items ? JSON.parse(items) : INITIAL_MENU_ITEMS;
};

export const saveMenuItems = (items: MenuItem[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
};

// --- Customers ---
export const getCustomers = (): Customer[] => {
  const customers = localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS);
  return customers ? JSON.parse(customers) : [];
};

export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const findOrAddCustomer = (name: string, phone: string, address: string): Customer => {
  const customers = getCustomers();
  let customer = customers.find(c => c.phone === phone);
  if (customer) {
    // Optionally update name/address if changed, or just return existing
    if(customer.name !== name || customer.address !== address) {
        customer.name = name;
        customer.address = address;
        saveCustomers(customers);
    }
    return customer;
  }
  customer = { id: generateUUID(), name, phone, address };
  customers.push(customer);
  saveCustomers(customers);
  return customer;
};

export const getCustomerByPhone = (phone: string): Customer | undefined => {
    const customers = getCustomers();
    return customers.find(c => c.phone === phone);
};


// --- Orders ---
export const getOrders = (): Order[] => {
  const orders = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
  return orders ? JSON.parse(orders) : [];
};

export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'totalAmount'>, customer: Customer): Order => {
  const orders = getOrders();
  const totalAmount = order.items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
  const newOrder: Order = {
    ...order,
    id: generateUUID(), // This is the Invoice No.
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    totalAmount,
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
};

export const getOrdersByCustomerPhone = (phone: string): Order[] => {
  const orders = getOrders();
  return orders.filter(order => order.customerPhone === phone).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
