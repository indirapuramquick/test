
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
      isActive
        ? 'bg-orange-600 text-white'
        : 'text-gray-200 hover:bg-red-700 hover:text-white'
    }`;

  return (
    <nav className="bg-red-700 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-start h-12 space-x-2 sm:space-x-4">
          <NavLink to="/new-order" className={navLinkClass}>
            New Order
          </NavLink>
          <NavLink to="/menu-editor" className={navLinkClass}>
            Menu Editor
          </NavLink>
          <NavLink to="/order-history" className={navLinkClass}>
            Order History
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
