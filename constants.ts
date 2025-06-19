
import { MenuItem } from './types';

export const RESTAURANT_NAME = "Indirapuram Quick Bites";
export const RESTAURANT_ADDRESS_LINE1 = "273-FF, Shakti Khand IV, Indirapuram";
export const RESTAURANT_PHONE = "9599256330";

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Veg Burger', price: 80, category: 'Burgers' },
  { id: 'm2', name: 'Chicken Burger', price: 120, category: 'Burgers' },
  { id: 'm3', name: 'Aloo Tikki Burger', price: 60, category: 'Burgers' },
  { id: 'm4', name: 'Paneer Wrap', price: 100, category: 'Wraps' },
  { id: 'm5', name: 'Chicken Shawarma', price: 150, category: 'Wraps' },
  { id: 'm6', name: 'French Fries (M)', price: 70, category: 'Sides' },
  { id: 'm7', name: 'French Fries (L)', price: 100, category: 'Sides' },
  { id: 'm8', name: 'Chilli Garlic Potato Pops', price: 90, category: 'Sides' },
  { id: 'm9', name: 'Veg Hakka Noodles', price: 130, category: 'Noodles' },
  { id: 'm10', name: 'Chicken Hakka Noodles', price: 160, category: 'Noodles' },
  { id: 'm11', name: 'Veg Spring Roll', price: 100, category: 'Starters' },
  { id: 'm12', name: 'Chicken Spring Roll', price: 130, category: 'Starters' },
  { id: 'm13', name: 'Coca-Cola (500ml)', price: 40, category: 'Beverages' },
  { id: 'm14', name: 'Mineral Water (1L)', price: 20, category: 'Beverages' },
  { id: 'm15', name: 'Fresh Lime Soda', price: 50, category: 'Beverages' },
];

export const LOCAL_STORAGE_KEYS = {
  MENU_ITEMS: 'iqb_menu_items',
  CUSTOMERS: 'iqb_customers',
  ORDERS: 'iqb_orders',
};
