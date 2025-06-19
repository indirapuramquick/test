import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { getMenuItems, saveMenuItems, generateUUID } from '../services/storageService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const MenuEditorPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [errors, setErrors] = useState<{ name?: string, price?: string, category?: string }>({});

  useEffect(() => {
    setMenuItems(getMenuItems());
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { name?: string, price?: string, category?: string } = {};
    if (!newItemName.trim()) newErrors.name = 'Name is required.';
    if (!newItemPrice.trim()) newErrors.price = 'Price is required.';
    else if (isNaN(parseFloat(newItemPrice)) || parseFloat(newItemPrice) <= 0) newErrors.price = 'Price must be a positive number.';
    if (!newItemCategory.trim()) newErrors.category = 'Category is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (!validateForm()) return;

    const newItem: MenuItem = {
      id: generateUUID(),
      name: newItemName.trim(),
      price: parseFloat(newItemPrice),
      category: newItemCategory.trim(),
    };
    const updatedMenuItems = [...menuItems, newItem];
    setMenuItems(updatedMenuItems);
    saveMenuItems(updatedMenuItems);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory('');
    setErrors({});
  };

  const handleRemoveItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const updatedMenuItems = menuItems.filter(item => item.id !== id);
      setMenuItems(updatedMenuItems);
      saveMenuItems(updatedMenuItems);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Add New Menu Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            label="Item Name" 
            value={newItemName} 
            onChange={(e) => setNewItemName(e.target.value)} 
            placeholder="e.g., Veg Pizza"
            error={errors.name}
          />
          <Input 
            label="Price (Rs.)" 
            type="number" 
            value={newItemPrice} 
            onChange={(e) => setNewItemPrice(e.target.value)} 
            placeholder="e.g., 150"
            error={errors.price}
          />
          <Input 
            label="Category" 
            value={newItemCategory} 
            onChange={(e) => setNewItemCategory(e.target.value)} 
            placeholder="e.g., Main Course"
            error={errors.category}
          />
        </div>
        <Button onClick={handleAddItem} className="mt-4" leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>
          Add Item
        </Button>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">Current Menu</h2>
        {menuItems.length === 0 ? (
          <p className="text-gray-600">No menu items available. Add some items above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Rs.)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <Button onClick={() => handleRemoveItem(item.id)} variant="danger" size="sm" aria-label="Remove item">
                         <TrashIcon className="h-4 w-4"/>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default MenuEditorPage;