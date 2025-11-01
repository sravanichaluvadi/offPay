import React from 'react';
import { ArrowLeftIcon } from './icons';

interface Goal {
  name: string;
  value: number;
  color: string;
}

interface GoalDetailsPageProps {
  onBack: () => void;
}

const GoalDetailsPage: React.FC<GoalDetailsPageProps> = ({ onBack }) => {
  const goals: Goal[] = [
    { name: 'Food', value: 40, color: '#1e40af' },
    { name: 'Savings', value: 25, color: '#60a5fa' },
    { name: 'Transport', value: 15, color: '#fbbf24' },
    { name: 'Bills', value: 20, color: '#34d399' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="flex items-center p-6 bg-blue-900 text-white flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-4">Money Management Details</h1>
      </header>
      <main className="flex-grow p-6 space-y-4 overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800">Your Spending Breakdown</h2>
        <p className="text-slate-600 pb-4">Here's a detailed look at how your funds are distributed across different categories.</p>
        
        {goals.map((goal) => (
            <div key={goal.name} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 transition-transform hover:scale-105">
                <div className="w-4 h-16 rounded" style={{ backgroundColor: goal.color }}></div>
                <div className="flex-grow">
                    <p className="text-lg font-bold text-slate-800">{goal.name}</p>
                    <p className="text-slate-500">This category represents {goal.value}% of your budget.</p>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                    {goal.value}%
                </div>
            </div>
        ))}
      </main>
    </div>
  );
};

export default GoalDetailsPage;