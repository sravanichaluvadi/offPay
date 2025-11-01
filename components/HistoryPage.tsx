import React from 'react';
import { ArrowLeftIcon, ArrowUpRightIcon, ArrowDownLeftIcon, QrCodeIcon } from './icons';

interface HistoryPageProps {
  onBack: () => void;
}

type Transaction = {
  id: string;
  type: 'sent' | 'received' | 'paid_qr';
  description: string;
  date: string;
  amount: number;
};

const dummyTransactions: Transaction[] = [
  { id: '1', type: 'sent', description: 'Sent to 9876543210', date: '2024-07-28', amount: 500 },
  { id: '2', type: 'received', description: 'Received from 8765432109', date: '2024-07-27', amount: 1200 },
  { id: '3', type: 'paid_qr', description: 'Paid at Cafe Coffee Day', date: '2024-07-26', amount: 350.75 },
  { id: '4', type: 'sent', description: 'Sent to 7654321098', date: '2024-07-25', amount: 2500 },
  { id: '5', type: 'received', description: 'Received from 6543210987', date: '2024-07-24', amount: 800 },
  { id: '6', type: 'sent', description: 'Sent to 9876543210', date: '2024-07-23', amount: 150 },
  { id: '7', type: 'paid_qr', description: 'Paid at Local Grocery', date: '2024-07-22', amount: 780.50 },
  { id: '8', type: 'received', description: 'Received from 8765432109', date: '2024-07-21', amount: 2000 },
];

const TransactionIcon: React.FC<{ type: Transaction['type'] }> = ({ type }) => {
  switch (type) {
    case 'sent':
      return <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><ArrowUpRightIcon className="w-5 h-5" /></div>;
    case 'received':
      return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><ArrowDownLeftIcon className="w-5 h-5" /></div>;
    case 'paid_qr':
      return <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center"><QrCodeIcon className="w-5 h-5" /></div>;
  }
};

const TransactionAmount: React.FC<{ type: Transaction['type']; amount: number }> = ({ type, amount }) => {
    const formattedAmount = amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    switch (type) {
        case 'sent':
        case 'paid_qr':
            return <span className="text-red-600 font-bold">- ₹{formattedAmount}</span>;
        case 'received':
            return <span className="text-emerald-600 font-bold">+ ₹{formattedAmount}</span>
    }
}


const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="flex items-center p-6 bg-blue-900 text-white flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-4">Transaction History</h1>
      </header>
      <main className="flex-grow overflow-y-auto">
        {dummyTransactions.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {dummyTransactions.map((tx) => (
              <li key={tx.id} className="p-4 flex items-center gap-4 hover:bg-slate-100/50 transition-colors">
                <TransactionIcon type={tx.type} />
                <div className="flex-grow">
                    <p className="font-semibold text-slate-800">{tx.description}</p>
                    <p className="text-sm text-slate-500">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                    <TransactionAmount type={tx.type} amount={tx.amount}/>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No transactions yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;