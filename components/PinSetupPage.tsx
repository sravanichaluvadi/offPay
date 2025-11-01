import React, { useState, useEffect, useCallback } from 'react';
import { LockIcon, BackspaceIcon, CheckCircleIcon } from './icons';

interface PinSetupPageProps {
  mode: 'setup' | 'confirm';
  originalPin?: string;
  onPinSet?: (pin: string) => void;
  onPinConfirm?: () => void;
}

const PinDisplay: React.FC<{ pinLength: number }> = ({ pinLength }) => {
    return (
        <div className="flex justify-center gap-3 md:gap-4 my-8">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        index < pinLength ? 'bg-blue-900 scale-110' : 'bg-slate-300'
                    }`}
                ></div>
            ))}
        </div>
    );
};

const NumericKeypad: React.FC<{ onKeyPress: (key: string) => void; onDelete: () => void }> = ({ onKeyPress, onDelete }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0'];

    return (
        <div className="grid grid-cols-3 gap-4">
            {keys.map((key) => (
                <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    disabled={!key}
                    className="h-20 rounded-full text-3xl font-light text-slate-700 bg-slate-200/50 hover:bg-slate-300/70 transition-colors disabled:bg-transparent"
                >
                    {key}
                </button>
            ))}
            <button
                onClick={onDelete}
                className="h-20 rounded-full text-3xl font-light text-slate-700 bg-slate-200/50 hover:bg-slate-300/70 transition-colors flex items-center justify-center"
            >
                <BackspaceIcon className="w-8 h-8"/>
            </button>
        </div>
    );
};

const PinSetupPage: React.FC<PinSetupPageProps> = ({ mode, originalPin, onPinSet, onPinConfirm }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const title = mode === 'setup' ? 'Create a PIN' : 'Confirm your PIN';
  const subtitle = 'For your security, you will need this to log in.';

  const handleKeyPress = useCallback((key: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + key);
    }
  }, [pin]);

  const handleDelete = useCallback(() => {
    setError(false);
    setPin(prev => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    if (pin.length === 6) {
      if (mode === 'setup' && onPinSet) {
        onPinSet(pin);
      } else if (mode === 'confirm' && onPinConfirm) {
        if (pin === originalPin) {
          setConfirmed(true);
          setTimeout(() => onPinConfirm(), 1000);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 1000);
        }
      }
    }
  }, [pin, mode, onPinSet, onPinConfirm, originalPin]);

  let statusMessage = '';
  if (error) {
    statusMessage = "PINs don't match. Try again.";
  } else if (confirmed) {
    statusMessage = "PIN set successfully!";
  }

  return (
    <div className="flex flex-col h-full p-8 text-center">
      <div className="pt-16">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {confirmed ? <CheckCircleIcon className="w-10 h-10 text-emerald-500"/> : <LockIcon className="w-8 h-8 text-blue-900" />}
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>

      <PinDisplay pinLength={pin.length} />

       <div className={`h-6 text-sm mb-2 transition-opacity duration-300 ${error || confirmed ? 'opacity-100' : 'opacity-0'}`}>
            {error && <p className="text-red-500 font-medium">{statusMessage}</p>}
            {confirmed && <p className="text-emerald-500 font-medium">{statusMessage}</p>}
       </div>

      <div className="flex-grow flex flex-col justify-end pb-4">
        <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default PinSetupPage;