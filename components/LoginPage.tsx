import React, { useState } from 'react';
import { PhoneIcon, ArrowRightIcon, UserIcon } from './icons';

interface LoginPageProps {
  onLoginSuccess: (phoneNumber: string, name: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phoneNumber.length >= 10) {
      onLoginSuccess(phoneNumber, name.trim());
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-900 to-blue-800 text-white p-8">
      <div className="flex-grow flex flex-col justify-center">
        <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
        <p className="text-lg text-blue-100/90 mb-12">Secure finance for everyone.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-blue-100/90 mb-2">
              Your full name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UserIcon className="w-5 h-5 text-blue-200" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. A. P. J. Abdul Kalam"
                className="w-full bg-blue-900/50 border-2 border-transparent focus:border-blue-300 focus:ring-0 text-white placeholder-blue-300/70 rounded-xl py-3 pl-12 pr-4 text-lg transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-blue-100/90 mb-2">
              Enter your phone number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <PhoneIcon className="w-5 h-5 text-blue-200" />
              </div>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 9876543210"
                className="w-full bg-blue-900/50 border-2 border-transparent focus:border-blue-300 focus:ring-0 text-white placeholder-blue-300/70 rounded-xl py-3 pl-12 pr-4 text-lg transition-all"
                required
                minLength={10}
                maxLength={10}
              />
            </div>
          </div>
          <p className="text-xs text-blue-100/90 mt-2">We'll send you a confirmation code.</p>

          <button
            type="submit"
            disabled={!name.trim() || phoneNumber.length < 10}
            className="w-full mt-8 bg-white text-blue-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg transform hover:scale-105 transition-transform disabled:bg-gray-300 disabled:text-gray-500 disabled:scale-100"
          >
            Continue <ArrowRightIcon className="w-6 h-6" />
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-blue-100/90 pb-4">
        By continuing, you agree to our Terms of Service.
      </div>
    </div>
  );
};

export default LoginPage;