"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef, type KeyboardEvent, useCallback } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconMessageCircle,
  IconHistory,
  IconPlant,
  IconPackage,
  IconGift,
  IconTool,
  IconChartBar,
  IconBrain,
  IconReceipt,
  IconPlus,
  IconMinus,
  IconTrash,
  IconUsers,
  IconTable,
  IconSend,
  IconTrashX,
  IconLanguage,
  IconSparkles,
  IconBook,
  IconTrendingUp,
  IconShieldCheck,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  timestamp: Date;
};

type UserMessage = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type FinancialSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseCategories: Record<string, number>;
  recentTransactions: string[];
  transactionCount: number;
};

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="max-w-[70%] rounded-lg px-4 py-3 bg-white text-black border border-gray-200">
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        <span className="text-sm text-gray-500 ml-2">BudgetBot is thinking...</span>
      </div>
    </div>
  </div>
);

const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-black w-[5vh] h-[5vh] md:w-[4.9vh] md:h-[4.9vh]"
      >
        <path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/>
        <path d="M16 10h.01"/>
        <path d="M2 8v1a2 2 0 0 0 2 2h1"/>
      </svg>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[1.6vw] font-semibold tracking-tight text-black"
      >
        BachatBox
      </motion.span>
    </div>
  );
};

const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-black w-[5vh] h-[5vh] md:w-[4.9vh] md:h-[4.9vh]"
      >
        <path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/>
        <path d="M16 10h.01"/>
        <path d="M2 8v1a2 2 0 0 0 2 2h1"/>
      </svg>
    </div>
  );
};

export default function ChatbotPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load user transaction data for context
  const getStorageKey = (): string | null => {
    return user?.id ? `bachatbox_${user.id}_transactions` : null;
  };

  const loadTransactions = (): Transaction[] => {
    const key = getStorageKey();
    if (key) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp)
          }));
        } catch (error) {
          console.error('Error parsing stored transactions:', error);
          return [];
        }
      }
    }
    return [];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize with welcome message
  useEffect(() => {
    if (isLoaded && user && messages.length === 0) {
      const welcomeMessage: UserMessage = {
        id: Date.now(),
        text: currentLanguage === 'hi' 
          ? "नमस्ते! मैं BudgetBot हूँ, आपका व्यक्तिगत वित्तीय सलाहकार। मैं आपके खर्चों और आय के डेटा के आधार पर आपको बेहतर वित्तीय सलाह दे सकता हूँ। आप मुझसे बजट, बचत, निवेश या अपनी वित्तीय आदतों के बारे में कुछ भी पूछ सकते हैं!"
          : "Hello! I'm BudgetBot, your personal financial advisor. I can provide you with insights and advice based on your spending and income data. Feel free to ask me about budgeting, saving, investments, or your financial habits!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isLoaded, user, currentLanguage]);

  const calculateFinancialSummary = (): FinancialSummary => {
    const transactions = loadTransactions();
    const totalIncome = transactions.filter((t: Transaction) => t.type === 'income').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    
    const expenseCategories = transactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((acc: Record<string, number>, t: Transaction) => {
        const category = t.description || 'Other';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const recentTransactions = transactions
      .slice(0, 5)
      .map((t: Transaction) => `${t.type === 'income' ? '+' : '-'}₹${t.amount} (${t.description})`);

    return {
      totalIncome,
      totalExpense,
      balance,
      expenseCategories,
      recentTransactions,
      transactionCount: transactions.length
    };
  };

  const handleLanguageSwitch = useCallback((language: 'en' | 'hi') => {
    setCurrentLanguage(language);
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
    setIsTyping(false);
    
    // Add new welcome message
    setTimeout(() => {
      const welcomeMessage: UserMessage = {
        id: Date.now(),
        text: currentLanguage === 'hi' 
          ? "नया चैट शुरू हुआ! मैं आपकी वित्तीय सहायता के लिए यहाँ हूँ। आप मुझसे क्या पूछना चाहते हैं?"
          : "New chat started! I'm here to help with your financial needs. What would you like to know?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 100);
  };
const links = [
    { label: "Balance Sheet", href: "/apppage", icon: <IconReceipt className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/apppage') },
    { label: "Visualise Stats", href: "/visualise", icon: <IconChartBar className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/visualise') },
    { label: "AI Dashboard", href: "/advice", icon: <IconTable className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/advice') },
    { label: "BudgetBot", href: "/chatbot", icon: <IconMessageCircle className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/chatbot') },
    { label: "What-If Simulator", href: "/simulator", icon: <IconSparkles className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/simulator') },
    { label: "SplitWise", href: "/splitwise", icon: <IconUsers className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/splitwise') },
    { label: "Financial Reads", href: "/financial-reads", icon: <IconBook className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/financial-reads') },
    { label: "Stock Market", href: "/investment", icon: <IconTrendingUp className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/investment') },
    { label: "Claim Radar", href: "/claimradar", icon: <IconShieldCheck className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/claimradar') },
  ];
  const typeWriterEffect = useCallback((text: string, messageId: number) => {
    setIsTyping(true);
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      setMessages((prev: UserMessage[]) => 
        prev.map((msg: UserMessage) => 
          msg.id === messageId 
            ? { ...msg, text: text.slice(0, currentIndex + 1) }
            : msg
        )
      );
      
      currentIndex++;
      
      if (currentIndex >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
    
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    const messageText = inputValue.trim();
    
    if (messageText) {
      const newMessage: UserMessage = {
        id: Date.now(),
        text: messageText,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages((prev: UserMessage[]) => [...prev, newMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const financialData = calculateFinancialSummary();
        
        const response = await fetch('/api/gemini-financial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            language: currentLanguage,
            financialData: financialData,
            userId: user?.id
          })
        });

        const data = await response.json();
        setIsLoading(false);
        
        const botMessageId = Date.now() + 1;
        const botResponse: UserMessage = {
          id: botMessageId,
          text: '',
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages((prev: UserMessage[]) => [...prev, botResponse]);
        typeWriterEffect(data.message, botMessageId);
        
      } catch (error) {
        setIsLoading(false);
        const errorResponse: UserMessage = {
          id: Date.now() + 1,
          text: currentLanguage === 'hi' 
            ? "क्षमा करें, कनेक्शन में समस्या है। कृपया फिर से कोशिश करें।"
            : "Sorry, I'm having trouble connecting. Please try again.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages((prev: UserMessage[]) => [...prev, errorResponse]);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <SignedIn>
        <div className="bg-[#ecf8e5] min-h-screen">
          {/* Fixed Sidebar */}
          <div className="fixed top-0 left-0 h-screen z-30">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
              <SidebarBody className="justify-between gap-10 bg-[#ecf8e5] h-full">
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                  <div 
                    className="cursor-pointer"
                    onMouseEnter={() => setSidebarOpen(true)}
                    onMouseLeave={() => setSidebarOpen(false)}
                  >
                    {sidebarOpen ? <Logo /> : <LogoIcon />}
                  </div>
                  <div className="mt-8 flex flex-col gap-2">
                    {links.map((link, idx) => (
                      <div key={idx} onClick={link.onClick} className="cursor-pointer">
                        <SidebarLink link={link} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <SidebarLink
                    link={{
                      label: user?.username || 'User',
                      href: "#",
                      icon: (
                        <div className="h-7 w-7 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                          {(user?.username?.[0] || user?.firstName?.[0] || 'U').toUpperCase()}
                        </div>
                      ),
                    }}
                  />
                </div>
              </SidebarBody>
            </Sidebar>
          </div>

          {/* Main Content Area with left margin for sidebar */}
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            {/* Fixed Top Navbar */}
            <div className="sticky top-0 z-20 flex items-center h-[9.5vh] bg-[#ecf8e5] px-8 border-b border-gray-200/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  
                </div>
                <div className="text-sm text-gray-600">
                  {currentLanguage === 'hi' ? 'आपका व्यक्तिगत वित्तीय सलाहकार' : 'Your Personal Financial Advisor'}
                </div>
              </div>
              
              <div className="flex-1" />
              
              <div className="flex items-center gap-4">
                {/* Language Switch */}
                <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => handleLanguageSwitch('en')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      currentLanguage === 'en' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageSwitch('hi')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      currentLanguage === 'hi' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>

                {/* New Chat Button */}
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-black border border-gray-200 rounded-lg font-medium transition-colors"
                >
                  <IconTrashX className="w-4 h-4" />
                  {currentLanguage === 'hi' ? 'नया चैट' : 'New Chat'}
                </button>

                <div
                  className="inline-flex w-[30vw] md:w-[7.5vw] items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-100 md:px-4 md:py-[0.45vw] py-[0.6vh] px-[0.5vw] text-lg font-semibold text-black shadow-sm ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    const btn = triggerRef.current?.querySelector('button');
                    btn?.click();
                  }}
                >
                  <span className='md:text-[1.1vw] text-[2vh]'>{user?.username || 'User'}</span>
                  <div ref={triggerRef} className="relative">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          userButtonPopoverCard: {
                            transform: 'translateY(3.5vh)',
                            '@media (max-width: 768px)': {
                              transform: 'translateY(3.5vh) translateX(4vw)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col h-[calc(100vh-9.5vh)]">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((message: UserMessage) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-4 py-3 ${
                        message.sender === 'user' 
                          ? 'bg-black text-white' 
                          : 'bg-white text-black border border-gray-200'
                      }`}>
                        <div className="text-sm md:text-base">{message.text}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200/50 bg-[#ecf8e5] p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 px-4 py-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={currentLanguage === 'hi' 
                        ? "अपनी वित्तीय समस्या या सवाल लिखें..."
                        : "Ask about your finances, budgeting, or savings..."
                      }
                      className="flex-1 outline-none text-sm md:text-base"
                      disabled={isLoading || isTyping}
                    />
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || isTyping}
                      className={`p-2 rounded-lg transition-colors ${
                        inputValue.trim() && !isLoading && !isTyping
                          ? 'bg-black hover:bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <IconSend className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    {currentLanguage === 'hi' 
                      ? "BudgetBot आपके वित्तीय डेटा के आधार पर व्यक्तिगत सलाह देता है"
                      : "BudgetBot provides personalized advice based on your financial data"
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
