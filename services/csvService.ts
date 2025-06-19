
import { Order, Customer, OrderItem } from '../types';
import Papa from 'papaparse';

const triggerCsvDownload = (csvData: string, filename: string): void => {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportOrdersToCsv = (orders: Order[]): void => {
  if (orders.length === 0) {
    alert('No orders to export.');
    return;
  }

  const flattenedOrders: any[] = [];
  orders.forEach(order => {
    order.items.forEach(item => {
      flattenedOrders.push({
        'Invoice ID': order.id,
        'Date': new Date(order.createdAt).toLocaleString(),
        'Customer Name': order.customerName,
        'Customer Phone': order.customerPhone,
        'Customer Address': order.customerAddress,
        'Order Type': order.orderType,
        'Item Name': item.nameAtOrder,
        'Quantity': item.quantity,
        'Price Per Item': item.priceAtOrder.toFixed(2),
        'Item Subtotal': (item.quantity * item.priceAtOrder).toFixed(2),
        'Total Bill Amount': order.totalAmount.toFixed(2),
        'Customer ID': order.customerId,
        'Menu Item ID': item.menuItemId,
      });
    });
  });

  const csv = Papa.unparse(flattenedOrders);
  triggerCsvDownload(csv, 'orders_history.csv');
};

export const exportCustomersToCsv = (customers: Customer[]): void => {
  if (customers.length === 0) {
    alert('No customers to export.');
    return;
  }
  const customerData = customers.map(customer => ({
    'Customer ID': customer.id,
    'Name': customer.name,
    'Phone Number': customer.phone,
    'Address': customer.address,
  }));
  const csv = Papa.unparse(customerData);
  triggerCsvDownload(csv, 'customer_database.csv');
};
