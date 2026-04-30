'use client';

import React from 'react';
import AuthStatus from './AuthStatus';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/" className="hover:text-gray-300">
            OperantKit Frontend
          </Link>
        </h1>
        <nav className="flex items-center space-x-4">
          <Link href="/settings" className="text-white hover:text-gray-300">
            Settings
          </Link>
          <Link href="/data" className="text-white hover:text-gray-300">
            Data
          </Link>
          {/* Add more navigation items here */}
          <AuthStatus />
        </nav>
      </div>
    </header>
  );
};

export default Header;
