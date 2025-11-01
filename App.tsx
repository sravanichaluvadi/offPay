import React, { useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import PinSetupPage from './components/PinSetupPage';
import DashboardPage from './components/DashboardPage';
import SendMoneyPage from './components/SendMoneyPage';
import PayQrPage from './components/PayQrPage';
import UssdPage from './components/UssdPage';
import GoalDetailsPage from './components/GoalDetailsPage';
import { AppView } from './types';
import { CheckCircleIcon, InformationCircleIcon } from './components/icons';

type SendMoneyData = { amount: string; recipient: string };

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.Login);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [notification, setNotification] = useState<{ title: string; message: string; show: boolean; type: 'success' | 'info' } | null>(null);
  const [sendMoneyData, setSendMoneyData] = useState<SendMoneyData | null>(null);

  const handleLoginSuccess = useCallback((phone: string, name: string) => {
    setPhoneNumber(phone);
    setUserName(name);
    setView(AppView.PinSetup);
  }, []);

  const handlePinSet = useCallback((newPin: string) => {
    setPin(newPin);
    setView(AppView.PinConfirm);
  }, []);

  const handlePinConfirmSuccess = useCallback(() => {
    // In a real app, you would now save the user/pin and log them in.
    setView(AppView.Dashboard);
  }, []);

  const handleLogout = useCallback(() => {
    setPhoneNumber('');
    setPin('');
    setUserName('');
    setView(AppView.Login);
  }, []);

  const handleStartSendMoney = useCallback((data?: SendMoneyData) => {
    setSendMoneyData(data || null);
    setView(AppView.SendMoney);
  }, []);
  
  const handleStartPayQr = useCallback(() => {
    setView(AppView.PayQr);
  }, []);

  const handleStartUssdPay = useCallback(() => {
    setView(AppView.UssdPay);
  }, []);

  const handleSendMoneyCompletion = useCallback((details?: { amount: string; recipient: string }) => {
    if (details) {
      const formattedAmount = Number(details.amount).toLocaleString('en-IN');
      setNotification({
        title: 'Success!',
        message: `Successfully sent ₹${formattedAmount} to ${details.recipient}`,
        show: true,
        type: 'success',
      });
    }
    setView(AppView.Dashboard);
    setSendMoneyData(null); // Clear data after completion
  }, []);

  const handlePayQrCompletion = useCallback((details: { amount: string }) => {
    const formattedAmount = Number(details.amount).toLocaleString('en-IN');
    setNotification({
        title: 'Success!',
        message: `Payment of ₹${formattedAmount} was successful`,
        show: true,
        type: 'success',
    });
    setView(AppView.Dashboard);
  }, []);

  const handleUssdCompletion = useCallback(() => {
    setNotification({
        title: 'Success!',
        message: 'Payment Successful',
        show: true,
        type: 'success',
    });
    setView(AppView.Dashboard);
  }, []);

  const handleCancelSendMoney = useCallback(() => {
    setView(AppView.Dashboard);
    setSendMoneyData(null); // Clear data on cancel
  }, []);
  
  const handleCancelPayQr = useCallback(() => {
    setView(AppView.Dashboard);
  }, []);

  const handleCancelOfflinePay = useCallback(() => {
    setView(AppView.Dashboard);
  }, []);

  const handleShowGoalDetails = useCallback(() => {
    setView(AppView.GoalDetails);
  }, []);

  const handleBackFromGoalDetails = useCallback(() => {
    setView(AppView.Dashboard);
  }, []);

  const handleCloseNotification = useCallback(() => {
     setNotification(prev => prev ? { ...prev, show: false } : null);
  }, []);


  const renderView = () => {
    switch (view) {
      case AppView.Login:
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case AppView.PinSetup:
        return <PinSetupPage mode="setup" onPinSet={handlePinSet} />;
      case AppView.PinConfirm:
        return (
          <PinSetupPage
            mode="confirm"
            originalPin={pin}
            onPinConfirm={handlePinConfirmSuccess}
          />
        );
      case AppView.Dashboard:
        return <DashboardPage userName={userName} phoneNumber={phoneNumber} onLogout={handleLogout} onSendMoney={handleStartSendMoney} onPayQr={handleStartPayQr} onUssdPay={handleStartUssdPay} originalPin={pin} onShowGoalDetails={handleShowGoalDetails} />;
      case AppView.SendMoney:
        return <SendMoneyPage originalPin={pin} onSend={handleSendMoneyCompletion} onCancel={handleCancelSendMoney} initialRecipient={sendMoneyData?.recipient} initialAmount={sendMoneyData?.amount} />;
      case AppView.PayQr:
        return <PayQrPage originalPin={pin} onPay={handlePayQrCompletion} onCancel={handleCancelPayQr} userName={userName} phoneNumber={phoneNumber} />;
      case AppView.UssdPay:
        return <UssdPage originalPin={pin} onCancel={handleCancelOfflinePay} onSuccess={handleUssdCompletion} />;
      case AppView.GoalDetails:
        return <GoalDetailsPage onBack={handleBackFromGoalDetails} />;
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="bg-slate-200 min-h-screen flex items-center justify-center font-sans">
      <div className="relative w-full max-w-sm h-[800px] max-h-[90vh] bg-slate-50 text-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-800 rounded-b-xl z-20"></div>
        <div className="w-full h-full overflow-y-auto">
          {renderView()}
        </div>
        
        {notification?.show && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 transition-opacity duration-300">
                <div className="bg-white rounded-2xl p-8 text-center flex flex-col items-center gap-4 w-full shadow-2xl animate-fade-in-up">
                    {notification.type === 'success' && <CheckCircleIcon className="w-20 h-20 text-emerald-500" />}
                    {notification.type === 'info' && <InformationCircleIcon className="w-20 h-20 text-blue-900" />}
                    <h2 className="text-xl font-bold text-slate-800">{notification.title}</h2>
                    <p className="text-slate-600">{notification.message}</p>
                    <button 
                      onClick={handleCloseNotification} 
                      className="w-full mt-4 bg-blue-900 text-white font-bold py-3 rounded-xl text-lg transition-transform hover:scale-105"
                    >
                      Done
                    </button>
                </div>
                <style>{`
                  @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                  }
                `}</style>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;