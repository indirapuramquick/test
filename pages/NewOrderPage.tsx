import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MenuItem, OrderItem, OrderType, Customer, Order } from '../types';
import { getMenuItems, findOrAddCustomer, addOrder, getCustomerByPhone } from '../services/storageService';
import { generateInvoicePdf, sharePdf } from '../services/pdfService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { ShoppingCartIcon, PlusIcon, MinusIcon, TrashIcon, UserPlusIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const NewOrderPage: React.FC = () => {
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderType, setOrderType] = useState<OrderType>(OrderType.TAKEAWAY);
  
  const [formErrors, setFormErrors] = useState<{ name?: string, phone?: string, address?: string, items?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAllMenuItems(getMenuItems());
  }, []);

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return allMenuItems;
    return allMenuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMenuItems, searchTerm]);

  const addMenuItemToOrder = (item: MenuItem) => {
    setCurrentOrderItems(prevItems => {
      const existingItem = prevItems.find(oi => oi.menuItemId === item.id);
      if (existingItem) {
        return prevItems.map(oi => 
          oi.menuItemId === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
        );
      }
      return [...prevItems, { menuItemId: item.id, nameAtOrder: item.name, priceAtOrder: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: string, change: number) => {
    setCurrentOrderItems(prevItems => 
      prevItems.map(item => 
        item.menuItemId === menuItemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
      ).filter(item => item.quantity > 0) // Remove if quantity becomes 0
    );
  };

  const totalBill = useMemo(() => {
    return currentOrderItems.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
  }, [currentOrderItems]);

  const validateOrder = (): boolean => {
    const errors: { name?: string, phone?: string, address?: string, items?: string } = {};
    if (!customerName.trim()) errors.name = "Customer name is required.";
    if (!customerPhone.trim()) errors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(customerPhone)) errors.phone = "Phone number must be 10 digits.";
    if (orderType === OrderType.DELIVERY && !customerAddress.trim()) errors.address = "Address is required for delivery.";
    if (currentOrderItems.length === 0) errors.items = "Please add at least one item to the order.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setOrderType(OrderType.TAKEAWAY);
    setCurrentOrderItems([]);
    setSearchTerm('');
    setFormErrors({});
  };

  const handleConfirmOrder = async () => {
    if (!validateOrder()) return;
    setIsLoading(true);

    try {
      const customer = findOrAddCustomer(customerName, customerPhone, customerAddress);
      const newOrderData: Omit<Order, 'id' | 'createdAt' | 'totalAmount'> = {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address, // Use customer.address which might have been updated by findOrAddCustomer
        orderType,
        items: currentOrderItems,
      };
      const confirmedOrder = addOrder(newOrderData, customer);
      
      const pdf = generateInvoicePdf(confirmedOrder);
      await sharePdf(pdf, `invoice-${confirmedOrder.id.substring(0,8)}.pdf`);
      
      alert(`Order confirmed! Invoice No: ${confirmedOrder.id.substring(0,8)}`);
      resetForm();

    } catch (error) {
      console.error("Error confirming order:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrefillCustomer = () => {
    if (!/^\d{10}$/.test(customerPhone)) {
        setFormErrors(prev => ({...prev, phone: "Enter a valid 10-digit phone to search."}));
        return;
    }
    const existingCustomer = getCustomerByPhone(customerPhone); 

    if (existingCustomer) {
        setCustomerName(existingCustomer.name);
        setCustomerAddress(existingCustomer.address);
        setFormErrors(prev => ({...prev, phone: undefined})); // Clear phone error if customer found
    } else {
        setFormErrors(prev => ({...prev, phone: "Customer not found. New customer will be created."}));
        setCustomerName(''); 
        setCustomerAddress('');
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Customer Details & Menu Search/List */}
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full Name" error={formErrors.name} />
            <div className="flex flex-col">
              <Input 
                label="Phone Number (10 digits)" 
                value={customerPhone} 
                onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0,10))} 
                placeholder="9876543210" 
                error={formErrors.phone} 
                maxLength={10} 
                containerClassName="mb-1"
              />
               <Button onClick={handlePrefillCustomer} size="sm" variant="secondary" className="self-start text-xs" leftIcon={<MagnifyingGlassIcon className="h-3 w-3"/>}>
                 Fetch Details
               </Button>
            </div>
            <Select label="Order Type" value={orderType} onChange={e => setOrderType(e.target.value as OrderType)} options={Object.values(OrderType).map(ot => ({value: ot, label: ot}))} />
            {orderType === OrderType.DELIVERY && (
              <Input label="Delivery Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Full Address" error={formErrors.address} containerClassName="md:col-span-2"/>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Select Items</h2>
          <Input 
            type="search" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Search menu items by name or category..." 
            containerClassName="mb-4"
          />
          {filteredMenuItems.length === 0 && searchTerm && (
             <p className="text-gray-500 text-center py-4">No items match your search "{searchTerm}".</p>
          )}
           {filteredMenuItems.length === 0 && !searchTerm && allMenuItems.length === 0 && (
             <p className="text-gray-500 text-center py-4">Menu is empty. Please add items in the Menu Editor.</p>
          )}
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {filteredMenuItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-md shadow-sm transition-colors">
                <div>
                  <h3 className="font-medium text-gray-700">{item.name} <span className="text-xs text-gray-500">({item.category})</span></h3>
                  <p className="text-sm text-orange-600 font-semibold">Rs. {item.price.toFixed(2)}</p>
                </div>
                <Button onClick={() => addMenuItemToOrder(item)} size="sm" variant="secondary" aria-label={`Add ${item.name} to order`}>
                  <PlusIcon className="h-5 w-5"/> Add
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column: Current Order Summary */}
      <div className="lg:col-span-1">
        <section className="bg-white p-6 rounded-lg shadow-lg sticky top-24"> {/* Sticky for desktop */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
            <ShoppingCartIcon className="h-6 w-6 mr-2 text-orange-500"/> Current Order
          </h2>
          {formErrors.items && <p className="text-sm text-red-500 mb-2">{formErrors.items}</p>}
          {currentOrderItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your order is empty. Add items from the menu.</p>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-1"> {/* Max height for scroll */}
              {currentOrderItems.map(item => (
                <div key={item.menuItemId} className="p-3 border border-gray-200 rounded-md shadow-sm bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-medium text-gray-700 text-sm">{item.nameAtOrder}</h4>
                        <p className="text-xs text-gray-500">Rs. {item.priceAtOrder.toFixed(2)} each</p>
                    </div>
                    <p className="font-semibold text-orange-600 text-sm">Rs. {(item.priceAtOrder * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-start mt-2 space-x-2">
                    <Button onClick={() => updateQuantity(item.menuItemId, -1)} size="sm" variant="secondary" aria-label="Decrease quantity">
                        <MinusIcon className="h-4 w-4"/>
                    </Button>
                    <span className="text-sm w-8 text-center font-medium">{item.quantity}</span>
                    <Button onClick={() => updateQuantity(item.menuItemId, 1)} size="sm" variant="secondary" aria-label="Increase quantity">
                        <PlusIcon className="h-4 w-4"/>
                    </Button>
                     <Button onClick={() => updateQuantity(item.menuItemId, -item.quantity)} size="sm" variant="danger" aria-label="Remove item">
                        <TrashIcon className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {currentOrderItems.length > 0 && (
            <>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Bill:</span>
                  <span className="text-orange-600">Rs. {totalBill.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                onClick={handleConfirmOrder} 
                fullWidth 
                className="mt-6" 
                disabled={isLoading}
                leftIcon={isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin"/> : <UserPlusIcon className="h-5 w-5"/>}
              >
                {isLoading ? 'Processing...' : 'Confirm Order & Generate Invoice'}
              </Button>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default NewOrderPage;