import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const ProfileLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="mb-4">You need to be logged in to access your profile.</p>
          <Link href="/auth/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
                <p className="text-gray-600">{user.role === 'parent' ? 'Parent' : 'Administrator'}</p>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link href="/profile" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                    My Profile
                  </Link>
                </li>
                {user.role === 'parent' && (
                  <li>
                    <Link href="/profile/children" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                      My Children
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/profile/notifications" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                    Notifications
                  </Link>
                </li>
                <li>
                  <Link href="/profile/security" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
