import React from 'react';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            {/* simple brand mark to match header */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M8 4h8l3 6-7 10L5 10l3-6z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">StyleMate</h1>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Sign in to continue. Use your Google account to securely access your wardrobe and outfits.
        </p>
        <div className="space-y-4">
          <div id="google-signin-button" className="flex justify-center" />
          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to the Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};