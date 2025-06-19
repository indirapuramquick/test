
import React from 'react';
import Navbar from './Navbar';
import { RESTAURANT_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">{RESTAURANT_NAME}</h1>
        </div>
        <Navbar />
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 text-sm">
        © {new Date().getFullYear()} {RESTAURANT_NAME}. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
