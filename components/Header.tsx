import React from 'react';
import { ShirtIcon } from './Icons';
import type { AuthUser } from '../services/authService';

interface HeaderProps {
  user: AuthUser | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <ShirtIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">StyleMate</h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <img src={user.picture || ''} alt={user.name || 'User'} className="w-8 h-8 rounded-full border border-gray-200" />
                <span className="text-sm text-gray-700 hidden sm:inline">{user.name || user.email}</span>
                <button onClick={onSignOut} className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Sign out</button>
              </>
            ) : (
              <div id="google-signin-button" />
            )}
          </div>
        </div>
    </header>
  );
};
