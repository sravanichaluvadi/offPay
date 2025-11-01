import React, { useState } from 'react';
import { ArrowLeftIcon, BackspaceIcon, PhoneCallIcon, UserIcon, LockIcon } from './icons';

interface UssdPageProps {
  originalPin: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const Dialpad: React.FC<{ onKeyPress: (key: string) => void; onDelete: () => void }> = ({ onKeyPress, onDelete }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

    return (
        <div className="grid grid-cols-3 gap-4">
            {keys.map((key) => (
                <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className="h-20 rounded-full text-3xl font-light text-slate-700 bg-slate-200/50 hover:bg-slate-300/70 transition-colors"
                >
                    {key}
                </button>
            ))}
            <div className="h-20" />
            <div className="h-20" />
             <button
                onClick={onDelete}
                className="h-20 rounded-full flex items-center justify-center text-slate-700 bg-slate-200/50 hover:bg-slate-300/70 transition-colors"
            >
                <BackspaceIcon className="w-8 h-8"/>
            </button>
        </div>
    );
};


const formatToIndianCurrency = (value: string) => {
  if (!value) return '';
  const numberValue = Number(value);
  if (isNaN(numberValue)) return '';
  return numberValue.toLocaleString('en-IN');
};

const UssdPage: React.FC<UssdPageProps> = ({ originalPin, onCancel, onSuccess }) => {
  const [step, setStep] = useState<'dialpad' | 'form'>('dialpad');
  const [isLoading, setIsLoading] = useState(false);
  const [dialInput, setDialInput] = useState('');

  // Form states
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  const handleKeyPress = (key: string) => {
    setDialInput(prev => prev + key);
  };
  
  const handleDelete = () => {
    setDialInput(prev => prev.slice(0, -1));
  };
  
  const handleDial = () => {
    if (dialInput === '*99#') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('form');
      }, 1500);
    }
  };
  
  const isFormValid = recipient.length === 10 && parseFloat(amount) > 0 && pin.length === 6;

  const handleSend = () => {
    if (!isFormValid) return;
    
    if (pin !== originalPin) {
      setPinError('Incorrect PIN. Please try again.');
      return;
    }
    onSuccess();
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
        <h1 className="text-xl font-bold ml-4">USSD Payment</h1>
      </header>

      {step === 'dialpad' && (
        <div className="relative flex flex-col h-full">
          <div className="flex-grow p-6 flex flex-col justify-end text-center">
            <p className="text-lg text-slate-500">Dial USSD code</p>
            <p className="text-4xl font-mono tracking-wider h-12 my-4 text-slate-800">{dialInput || <span className="text-slate-400">*99#</span>}</p>
          </div>
          <div className="p-6 bg-slate-100/50">
            <Dialpad onKeyPress={handleKeyPress} onDelete={handleDelete} />
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleDial}
                disabled={dialInput !== '*99#'}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 disabled:bg-slate-400 disabled:scale-100"
              >
                <PhoneCallIcon className="w-8 h-8" />
              </button>
            </div>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
              <div className="bg-white rounded-2xl p-8 text-center flex flex-col items-center gap-4 w-full max-w-xs shadow-2xl">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
                <p className="text-lg text-slate-600 font-semibold">ussd code is generating</p>
              </div>
            </div>
          )}
           <style>{`
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
              }
            `}</style>
        </div>
      )}

      {step === 'form' && (
        <>
        <main className="flex-grow p-6 space-y-6 overflow-y-auto">
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
                  autoFocus
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
            onClick={handleSend}
            disabled={!isFormValid}
            className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </footer>
        </>
      )}
    </div>
  );
};

export default UssdPage;