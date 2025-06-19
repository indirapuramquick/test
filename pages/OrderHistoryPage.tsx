
import React, { useState, useMemo, useEffect } from 'react';
import { Order, Customer } from '../types';
import { getOrders, getCustomers, getOrdersByCustomerPhone } from '../services/storageService';
import { exportOrdersToCsv, exportCustomersToCsv } from '../services/csvService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ArrowDownTrayIcon, MagnifyingGlassIcon as SearchCircleIcon } from '@heroicons/react/24/outline'; // Corrected icon name and alias for SearchCircleIcon

const OrderHistoryPage: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<Order[]>([]);
  const [searchMessage, setSearchMessage] = useState<string>('');

  useEffect(() => {
    setAllOrders(getOrders());
    setAllCustomers(getCustomers());
  }, []);

  const handleSearchByPhone = () => {
    if (!searchPhone.trim() || !/^\d{10}$/.test(searchPhone)) {
        setSearchMessage('Please enter a valid 10-digit phone number.');
        setSearchedOrders([]);
        return;
    }
    const orders = getOrdersByCustomerPhone(searchPhone);
    setSearchedOrders(orders);
    if (orders.length === 0) {
        setSearchMessage(`No orders found for phone number ${searchPhone}.`);
    } else {
        setSearchMessage('');
    }
  };

  const handleDownloadAllOrders = () => {
    exportOrdersToCsv(allOrders);
  };

  const handleDownloadCustomers = () => {
    exportCustomersToCsv(allCustomers);
  };
  
  const OrderCard: React.FC<{order: Order}> = ({order}) => (
    <div className="bg-white p-4 rounded-lg shadow transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs text-gray-500">Invoice ID: <span className="font-medium text-gray-700">{order.id.substring(0,8)}</span></p>
          <p className="text-sm font-semibold text-orange-600">{order.customerName}</p>
          <p className="text-xs text-gray-500">Ph: {order.customerPhone}</p>
        </div>
        <div className="text-right">
            <p className="text-lg font-bold text-gray-800">Rs. {order.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>
       <p className="text-xs text-gray-500 mb-2">Type: {order.orderType} {order.orderType === "Delivery" && order.customerAddress ? `to ${order.customerAddress}` : ''}</p>
      <details className="text-xs">
          <summary className="cursor-pointer text-orange-500 hover:text-orange-600">View Items ({order.items.length})</summary>
          <ul className="mt-2 space-y-1 pl-4 list-disc list-inside bg-gray-50 p-2 rounded">
              {order.items.map(item => (
                  <li key={item.menuItemId} className="text-gray-600">
                      {item.nameAtOrder} (x{item.quantity}) - Rs. {(item.priceAtOrder * item.quantity).toFixed(2)}
                  </li>
              ))}
          </ul>
      </details>
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">Search Orders by Phone</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 mb-4">
          <Input 
            label="Customer Phone (10 digits)"
            value={searchPhone} 
            onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0,10))} 
            placeholder="9876543210"
            maxLength={10}
            containerClassName="flex-grow mb-0"
          />
          <Button onClick={handleSearchByPhone} leftIcon={<SearchCircleIcon className="h-5 w-5"/>} className="w-full sm:w-auto">
            Search
          </Button>
        </div>
        {searchMessage && <p className="text-sm text-gray-600 mb-4">{searchMessage}</p>}
        {searchedOrders.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {searchedOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">Data Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleDownloadAllOrders} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>} disabled={allOrders.length === 0}>
            Download All Orders (CSV)
            <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{allOrders.length}</span>
          </Button>
          <Button onClick={handleDownloadCustomers} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>} disabled={allCustomers.length === 0}>
            Download Customer Database (CSV)
            <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{allCustomers.length}</span>
          </Button>
        </div>
        {allOrders.length === 0 && <p className="text-sm text-gray-500 mt-3">No orders available to export.</p>}
        {allCustomers.length === 0 && <p className="text-sm text-gray-500 mt-3">No customers available to export.</p>}
      </section>
    </div>
  );
};

export default OrderHistoryPage;
