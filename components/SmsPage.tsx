import React, { useState } from 'react';
import { ArrowLeftIcon, UserIcon, LockIcon, SmsIcon } from './icons';

interface SmsPageProps {
  originalPin: string;
  onCancel: () => void;
}

const formatToIndianCurrency = (value: string) => {
  if (!value) return '';
  const numberValue = Number(value);
  if (isNaN(numberValue)) return '';
  return numberValue.toLocaleString('en-IN');
};

const SmsPage: React.FC<SmsPageProps> = ({ originalPin, onCancel }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const isFormValid = recipient.length === 10 && parseFloat(amount) > 0 && pin.length === 6;

  const handleProceed = () => {
    if (!isFormValid) return;
    
    if (pin !== originalPin) {
      setPinError('Incorrect PIN. Please try again.');
      return;
    }
    
    // A dummy service number for SMS payments. In a real scenario, this would be a specific bank or service number.
    const serviceNumber = '5551234'; 
    const messageBody = `PAY ${recipient} ${amount} ${pin}`;
    
    // Create a temporary link to trigger the phone's messaging app
    const link = document.createElement('a');
    link.href = `sms:${serviceNumber}?body=${encodeURIComponent(messageBody)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Your phone's messaging app will open. Press 'send' to complete your transaction.");
    onCancel(); // Return to dashboard
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setAmount(rawValue);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value.replace(/[^0-9]/g, ''));
    if (pinError) {
      setPinError('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="flex items-center p-6 bg-blue-900 text-white flex-shrink-0">
        <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-4">SMS Payment</h1>
      </header>

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        <div className="text-center p-4 bg-slate-100 text-slate-600 rounded-lg">
            <SmsIcon className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">You are making an offline payment using SMS. This will open your phone's messaging app.</p>
        </div>
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-slate-600 mb-2">
            Recipient's Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <UserIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              id="recipient"
              type="tel"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="10-digit mobile number"
              className="w-full bg-white border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-xl py-3 pl-12 pr-4 text-lg"
              maxLength={10}
            />
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-600 mb-2">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <span className="text-slate-500 text-lg font-semibold">₹</span>
            </div>
            <input
              id="amount"
              type="text"
              inputMode="numeric"
              value={formatToIndianCurrency(amount)}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full bg-white border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-xl py-3 pl-10 pr-4 text-lg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-slate-600 mb-2">
            Enter your 6-digit PIN
          </label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <LockIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={handlePinChange}
              placeholder="••••••"
              className="w-full bg-white border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-xl py-3 pl-12 pr-4 text-lg tracking-[8px] text-center"
              maxLength={6}
            />
          </div>
          {pinError && <p className="text-red-500 text-sm mt-2">{pinError}</p>}
        </div>
      </main>

      <footer className="p-6 bg-white border-t border-slate-200 flex-shrink-0">
        <button
          onClick={handleProceed}
          disabled={!isFormValid}
          className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
        >
          Generate & Send SMS
        </button>
      </footer>
    </div>
  );
};

export default SmsPage;