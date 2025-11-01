import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, LockIcon } from './icons';

interface PayQrPageProps {
  originalPin: string;
  onPay: (details: { amount: string }) => void;
  onCancel: () => void;
  userName: string;
  phoneNumber: string;
}

const formatToIndianCurrency = (value: string) => {
  if (!value) return '';
  const numberValue = Number(value);
  if (isNaN(numberValue)) return '';
  return numberValue.toLocaleString('en-IN');
};


const PayQrPage: React.FC<PayQrPageProps> = ({ originalPin, onPay, onCancel, userName, phoneNumber }) => {
  const [amount, setAmount] = useState(''); // Stores raw numeric string e.g., "100000"
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // Construct a UPI string for the QR code
    const upiId = `${phoneNumber}@okbank`; // Using phone number to create a dummy VPA
    const name = encodeURIComponent(userName);
    const amountParam = parseFloat(amount) > 0 ? `&am=${amount}` : '';
    
    const upiString = `upi://pay?pa=${upiId}&pn=${name}${amountParam}&cu=INR`;
    const encodedUpiString = encodeURIComponent(upiString);

    // Use a reliable QR code generation API
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${encodedUpiString}&size=256x256`);

  }, [amount, userName, phoneNumber]);


  const isFormValid = parseFloat(amount) > 0 && pin.length === 6;

  const handlePay = () => {
    if (!isFormValid) return;
    
    if (pin !== originalPin) {
      setPinError('Incorrect PIN. Please try again.');
      return;
    }

    onPay({ amount });
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
        <h1 className="text-xl font-bold ml-4">Pay via QR</h1>
      </header>

      <main className="flex-grow p-6 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-xs flex items-center justify-center">
             <div className="bg-white p-2 border-4 border-slate-300 rounded-2xl shadow-lg w-[280px] h-[280px] flex items-center justify-center">
                {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code for payment" width="256" height="256" />
                ) : (
                    <div className="w-64 h-64 bg-slate-200 animate-pulse rounded-lg" />
                )}
            </div>
        </div>
        <p className="text-slate-500 mt-4 text-center">Scan this code to receive payment.</p>
        
        <div className="w-full mt-8 space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-600 mb-2">
                Amount (Optional)
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
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-slate-600 mb-2">
                Enter your 6-digit PIN to Authorize
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
        </div>
      </main>

      <footer className="p-6 bg-white border-t border-slate-200 flex-shrink-0">
        <button
          onClick={handlePay}
          disabled={!isFormValid}
          className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
        >
          Pay
        </button>
      </footer>
    </div>
  );
};

export default PayQrPage;