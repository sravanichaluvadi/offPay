import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserIcon,
  BellIcon,
  EyeIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  QrCodeIcon,
  MicrophoneIcon,
  HomeIcon,
  ReceiptIcon,
  CogIcon,
  LogoutIcon,
  UssdIcon,
  CreditCardIcon,
  XCircleIcon,
  SparklesIcon,
} from './icons';
import { GoogleGenAI, FunctionDeclaration, Type, Modality } from '@google/genai';


export interface Goal {
  name: string;
  value: number;
  color: string;
  className: string;
}

type SendMoneyData = { amount: string; recipient: string };

interface DashboardPageProps {
    userName: string;
    phoneNumber: string;
    onLogout: () => void;
    onSendMoney: (data?: SendMoneyData) => void;
    onPayQr: () => void;
    onUssdPay: () => void;
    originalPin: string;
    onShowGoalDetails: () => void;
}

// TTS Audio Decoding Helper Functions (as per Gemini API guidelines)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000); // Mono, 24kHz sample rate
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}


const DashboardHeader: React.FC<{ userName: string; onLogout: () => void }> = ({ userName, onLogout }) => (
    <header className="flex justify-between items-center p-6 bg-blue-900 text-white rounded-b-3xl">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <UserIcon className="w-7 h-7" />
            </div>
            <div>
                <p className="text-sm font-light">Welcome back,</p>
                <h2 className="text-lg font-bold">{userName}_N@lll</h2>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button className="relative"><BellIcon className="w-6 h-6" /></button>
            <button onClick={onLogout}><LogoutIcon className="w-6 h-6" /></button>
        </div>
    </header>
);

const BalanceCard: React.FC<{ onToggleVisibility: () => void; }> = ({ onToggleVisibility }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mx-6 -mt-12 relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-500">Total Balance</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                        {'₹••••••'}
                    </p>
                </div>
                <button onClick={onToggleVisibility}>
                    <EyeIcon className="w-6 h-6 text-slate-400" />
                </button>
            </div>
        </div>
    );
};

const QuickActions: React.FC<{ onSendMoney: () => void; onShowBalance: () => void; onPayQr: () => void; }> = ({ onSendMoney, onShowBalance, onPayQr }) => {
    const actions = [
        { name: 'Send', icon: ArrowUpRightIcon, color: 'bg-emerald-100 text-emerald-600', handler: onSendMoney },
        { name: 'Request', icon: ArrowDownLeftIcon, color: 'bg-sky-100 text-sky-600', handler: () => alert('Request Money feature coming soon!') },
        { name: 'Pay QR', icon: QrCodeIcon, color: 'bg-violet-100 text-violet-600', handler: onPayQr },
        { name: 'Bal', icon: CreditCardIcon, color: 'bg-amber-100 text-amber-600', handler: onShowBalance },
    ];
    return (
        <div className="px-6 mt-6">
            <div className="grid grid-cols-4 gap-4">
                {actions.map(action => (
                    <div key={action.name} className="flex flex-col items-center gap-2">
                        <button onClick={action.handler} className={`w-16 h-16 rounded-full flex items-center justify-center ${action.color} transition-transform hover:scale-110`}>
                            <action.icon className="w-7 h-7" />
                        </button>
                        <p className="text-sm font-medium text-slate-700">{action.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MoneyManagement: React.FC<{ onShowGoalDetails: () => void }> = ({ onShowGoalDetails }) => {
  const data: Goal[] = [
    { name: 'Food', value: 40, color: '#1e40af', className: 'bg-blue-800' },
    { name: 'Savings', value: 25, color: '#60a5fa', className: 'bg-blue-400' },
    { name: 'Transport', value: 15, color: '#fbbf24', className: 'bg-amber-400' },
    { name: 'Bills', value: 20, color: '#34d399', className: 'bg-emerald-400' },
  ];

  const size = 160;
  const strokeWidth = 40;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;

  return (
    <div className="px-6 mt-8">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Money Management</h3>
      <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-center">
        <div 
          className="relative cursor-pointer" 
          style={{ width: size, height: size }}
          onClick={onShowGoalDetails}
          aria-label="View money management details"
          role="button"
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
            />
            {data.map((segment) => {
              const dash = (segment.value / 100) * circumference;
              const offset = (cumulativePercentage / 100) * circumference;
              const slice = (
                <circle
                  key={segment.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={-offset}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
              cumulativePercentage += segment.value;
              return slice;
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
              {data.reduce((acc, segment) => {
                const midAngleDeg = (acc.cumulative + segment.value / 2) * 3.6 - 90;
                const midAngleRad = (midAngleDeg * Math.PI) / 180;
                const textX = center + radius * Math.cos(midAngleRad);
                const textY = center + radius * Math.sin(midAngleRad);

                acc.elements.push(
                  <text
                    key={segment.name}
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan x={textX} dy="-0.6em">{segment.name}</tspan>
                    <tspan x={textX} dy="1.2em">{segment.value}%</tspan>
                  </text>
                );
                acc.cumulative += segment.value;
                return acc;
              }, { elements: [] as React.ReactElement[], cumulative: 0 }).elements}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};


const OfflinePayments: React.FC<{ onUssdPay: () => void; }> = ({ onUssdPay }) => (
    <div className="px-6 mt-8">
        <h3 className="text-lg font-bold text-slate-800">Offline Payments</h3>
        <div className="grid grid-cols-1 gap-4 mt-4">
            <button onClick={onUssdPay} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center"><UssdIcon className="w-6 h-6"/></div>
                <p className="font-semibold text-slate-700">USSD Code</p>
            </button>
        </div>
    </div>
);


const BottomNavBar: React.FC = () => (
    <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-2 flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 text-blue-900">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
            <ReceiptIcon className="w-6 h-6" />
            <span className="text-xs">History</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
            <CogIcon className="w-6 h-6" />
            <span className="text-xs">Settings</span>
        </button>
    </div>
);

type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

const VoiceAssistantModal: React.FC<{
    state: AssistantState;
    userTranscript: string;
    assistantResponse: string;
    onClose: () => void;
}> = ({ state, userTranscript, assistantResponse, onClose }) => (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col justify-end z-50 p-4" onClick={onClose}>
        <div className="w-full bg-slate-800/80 rounded-3xl p-6 text-white flex flex-col gap-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            {userTranscript && (
                <div className="text-right">
                    <p className="inline-block bg-blue-600 rounded-xl rounded-br-none px-4 py-2">{userTranscript}</p>
                </div>
            )}
            
            {(state === 'thinking' || assistantResponse) && (
                 <div className="text-left">
                    <div className="inline-block bg-slate-700 rounded-xl rounded-bl-none px-4 py-2">
                       {state === 'thinking' ? (
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                            </div>
                       ) : (
                           <p>{assistantResponse}</p>
                       )}
                    </div>
                </div>
            )}
            
            <div className="flex items-center justify-center flex-col gap-4 mt-4">
                <div className="w-20 h-20 rounded-full bg-blue-900 flex items-center justify-center">
                    {state === 'listening' ? (
                        <MicrophoneIcon className="w-10 h-10 text-white animate-pulse-voice" />
                    ) : (
                        <SparklesIcon className="w-10 h-10 text-white"/>
                    )}
                </div>
                <p className="text-slate-300 text-center">
                   {state === 'listening' && "Listening..."}
                   {state === 'thinking' && "Thinking..."}
                   {state === 'speaking' && "Speaking..."}
                   {state === 'idle' && "How can I help?"}
                </p>
            </div>
        </div>
    </div>
);


const DashboardPage: React.FC<DashboardPageProps> = ({ userName, phoneNumber, onLogout, onSendMoney, onPayQr, onUssdPay, originalPin, onShowGoalDetails }) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Voice Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);


  const balance = "12,507.50";

  const handleRequestBalance = () => {
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };
  
  const speakText = useCallback(async (text: string) => {
    setAssistantState('speaking');
    setAssistantResponse(text);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say: ${text}` }] }],
            config: { responseModalities: [Modality.AUDIO] },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioContext = audioContextRef.current;
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            return new Promise<void>(resolve => {
                source.onended = () => resolve();
                source.start();
            });
        }
    } catch (error) {
        console.error("TTS Error:", error);
        setAssistantResponse("Sorry, I'm having trouble speaking right now.");
    } finally {
        setAssistantState('idle');
    }
  }, []);

  const getAssistantResponse = useCallback(async (transcript: string) => {
    setUserTranscript(transcript);
    setAssistantState('thinking');
    setAssistantResponse('');
    
    const sendMoneyTool: FunctionDeclaration = {
      name: 'sendMoney',
      parameters: {
        type: Type.OBJECT,
        description: 'Sends a specified amount of money to a recipient.',
        properties: {
          amount: { type: Type.NUMBER, description: 'The amount of money to send.' },
          recipient: { type: Type.STRING, description: 'The 10-digit phone number of the recipient.' },
        },
        required: ['amount', 'recipient'],
      },
    };
    
    const checkBalanceTool: FunctionDeclaration = { name: 'checkBalance', parameters: { type: Type.OBJECT, properties: {} } };
    const payWithQrTool: FunctionDeclaration = { name: 'payWithQr', parameters: { type: Type.OBJECT, properties: {} } };

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: transcript,
        config: {
            tools: [{ functionDeclarations: [sendMoneyTool, checkBalanceTool, payWithQrTool] }],
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        if (fc.name === 'sendMoney') {
            const { amount, recipient } = fc.args;
            const cleanRecipient = String(recipient).replace(/\D/g, '');
            if (amount > 0 && cleanRecipient.length === 10) {
                await speakText(`OK, sending ₹${amount} to ${recipient}. Please confirm the details.`);
                onSendMoney({ amount: String(amount), recipient: cleanRecipient });
                setIsAssistantOpen(false);
            } else {
                await speakText("I seem to be missing some details. Could you please provide the amount and a 10-digit recipient number?");
            }
        } else if (fc.name === 'checkBalance') {
            await speakText("Of course. Please enter your PIN to view your balance.");
            handleRequestBalance();
            setIsAssistantOpen(false);
        } else if (fc.name === 'payWithQr') {
            await speakText("Right away. Opening the QR payment screen.");
            onPayQr();
            setIsAssistantOpen(false);
        }
      } else {
        await speakText(response.text);
      }
    } catch (error) {
        console.error("Gemini Error:", error);
        await speakText("I'm sorry, I ran into a problem. Could you try that again?");
    } finally {
        if(isAssistantOpen) setAssistantState('idle');
    }

  }, [isAssistantOpen, onSendMoney, onPayQr, speakText]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported by this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      getAssistantResponse(transcript);
    };

    recognition.onerror = (event: any) => {
        setAssistantState('idle');
        if (event.error !== 'no-speech') {
            console.error("Speech Recognition Error:", event.error);
            setAssistantResponse("Sorry, I had trouble with the microphone.");
        }
    };

    recognition.onend = () => {
        if (assistantState === 'listening') {
             setAssistantState('idle');
        }
    };
    
    return () => {
        recognition.stop();
    }
  }, [getAssistantResponse, assistantState]);


  const startListening = useCallback(() => {
    if (recognitionRef.current && assistantState === 'idle') {
        try {
            setUserTranscript('');
            setAssistantResponse('');
            setAssistantState('listening');
            recognitionRef.current.start();
        } catch (e) {
            console.error("Could not start recognition:", e);
            setAssistantState('idle');
        }
    }
  }, [assistantState]);
  
  const handleAssistantOpen = async () => {
    setUserTranscript('');
    setAssistantResponse('');
    setIsAssistantOpen(true);
    setAssistantState('idle');
    await speakText("How can I help you?");
    startListening();
  };

  const handleAssistantClose = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    setIsAssistantOpen(false);
    setAssistantState('idle');
  }

  const handlePinVerify = () => {
    if (pinInput === originalPin) {
      setShowPinModal(false);
      setShowBalanceModal(true);
    } else {
      setPinError('Incorrect PIN. Please try again.');
    }
    setPinInput('');
  };

  const handleCloseBalanceModal = () => {
    setShowBalanceModal(false);
  };
  
  const handleClosePinModal = () => {
    setShowPinModal(false);
  };

  return (
    <div className="relative h-full bg-slate-50 flex flex-col">
        <DashboardHeader userName={userName} onLogout={onLogout} />
        <main className="flex-grow overflow-y-auto pb-24">
            <BalanceCard onToggleVisibility={handleRequestBalance} />
            <QuickActions onSendMoney={onSendMoney} onShowBalance={handleRequestBalance} onPayQr={onPayQr}/>
            <MoneyManagement onShowGoalDetails={onShowGoalDetails} />
            <OfflinePayments onUssdPay={onUssdPay} />
        </main>
        <div className="absolute bottom-20 right-6 z-20">
            <button onClick={handleAssistantOpen} className="w-16 h-16 bg-blue-900 rounded-full shadow-lg flex items-center justify-center text-white transform hover:scale-110 transition-transform">
                <MicrophoneIcon className="w-8 h-8"/>
            </button>
        </div>
        <div className="absolute bottom-0 w-full">
             <BottomNavBar />
        </div>

        {isAssistantOpen && (
            <VoiceAssistantModal
                state={assistantState}
                userTranscript={userTranscript}
                assistantResponse={assistantResponse}
                onClose={handleAssistantClose}
            />
        )}


        {showPinModal && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                <div className="relative bg-white rounded-2xl p-8 text-center flex flex-col items-center gap-4 w-full shadow-2xl animate-fade-in-up">
                    <button onClick={handleClosePinModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">Enter PIN</h2>
                    <p className="text-slate-600">Enter your 6-digit PIN to view your balance.</p>
                    <div className="relative w-full max-w-xs mt-4">
                        <input
                            id="pin-check"
                            type="password"
                            inputMode="numeric"
                            value={pinInput}
                            onChange={(e) => {
                                setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                                if (pinError) setPinError('');
                            }}
                            placeholder="••••••"
                            className="w-full bg-slate-100 border-2 border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-xl py-3 px-4 text-2xl tracking-[12px] text-center"
                            maxLength={6}
                            autoFocus
                        />
                    </div>
                    {pinError && <p className="text-red-500 text-sm mt-2 h-5">{pinError}</p>}
                    {!pinError && <div className="h-5 mt-2"></div>}
                    <button 
                        onClick={handlePinVerify}
                        disabled={pinInput.length !== 6}
                        className="w-full mt-4 bg-blue-900 text-white font-bold py-3 rounded-xl text-lg transition-transform hover:scale-105 disabled:bg-slate-400"
                    >
                        Verify
                    </button>
                </div>
            </div>
        )}

        {showBalanceModal && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                <div 
                    className="relative bg-gradient-to-br from-blue-800 to-blue-700 text-white p-8 text-center flex flex-col items-center justify-center w-80 h-64 shadow-2xl animate-fade-in-up"
                    style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
                >
                    <p className="text-lg font-light text-blue-100/80">Total Balance</p>
                    <p className="text-5xl font-bold mt-2 text-white">
                        ₹{balance}
                    </p>
                    <button 
                        onClick={handleCloseBalanceModal}
                        className="mt-8 bg-white/50 text-blue-900 font-bold py-2 px-6 rounded-full text-md transition-transform hover:scale-105"
                    >
                        Done
                    </button>
                </div>
            </div>
        )}
        <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
          }
          @keyframes pulse-voice {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.8;
            }
          }
          .animate-pulse-voice {
            animation: pulse-voice 2s infinite ease-in-out;
          }
           @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-bounce {
            animation: bounce 1s infinite;
          }
        `}</style>
    </div>
  );
};

export default DashboardPage;