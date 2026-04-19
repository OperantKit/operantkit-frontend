// operantkit/apps/operantkit-frontend/app/profile/page.tsx
'use client'; // This is a client component

import React from 'react';

export default function ProfilePage() {
  // Mock user data for now
  const user = {
    username: 'TestUser',
    email: 'test@example.com',
    // Add other profile details as needed
  };

  const handleEditProfile = () => {
    alert('Edit Profile functionality to be implemented.');
    // In a real app, this would navigate to an edit form or open a modal
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">User Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username:
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{user.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email:
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{user.email}</p>
          </div>
          {/* Add more profile fields here */}
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleEditProfile}
            className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
