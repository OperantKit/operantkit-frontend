'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const AuthStatus: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex items-center space-x-4 text-white">
      {isLoggedIn ? (
        <>
          <span className="text-sm">Logged in as: {user?.username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="text-sm font-medium hover:text-gray-300">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium hover:text-gray-300">
            Register
          </Link>
        </>
      )}
    </div>
  );
};

export default AuthStatus;
