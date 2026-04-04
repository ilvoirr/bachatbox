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
  IconCamera,
  IconUpload,
  IconSparkles,
  IconBook,
  IconTrendingUp,
  IconRefresh,
  IconShieldCheck
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category?: string;
  timestamp: Date;
  source?: string;
};

type UserMessage = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type ReceiptData = {
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: string;
  confidence: number;
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
        <span className="text-sm text-gray-500 ml-2">...</span>
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
        className="text-black w-[10vh] h-[10vh] md:w-[4.9vh] md:h-[4.9vh]"
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

export default function AppPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);

  // All your existing state
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Balance Sheet State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Receipt Scanner State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [extractedReceiptData, setExtractedReceiptData] = useState<ReceiptData | null>(null);
  const [showReceiptConfirmation, setShowReceiptConfirmation] = useState(false);

  // Local Storage Functions
  const getStorageKey = () => {
    return user?.id ? `bachatbox_${user.id}_transactions` : null;
  };

  const saveTransactions = (newTransactions: Transaction[]) => {
    const key = getStorageKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(newTransactions));
    }
  };

  const loadTransactions = () => {
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

  const resetAllData = () => {
    const key = getStorageKey();
    if (key) {
      localStorage.removeItem(key);
      setTransactions([]);
      setShowResetModal(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    if (isLoaded && user?.id) {
      const storedTransactions = loadTransactions();
      console.log('📂 Loaded from storage:', storedTransactions.length, 'transactions');
      setTransactions(storedTransactions);
    }
  }, [isLoaded, user?.id]);

  // Calculate balance
  const calculateBalance = () => {
    const balance = transactions.reduce((total, transaction) => {
      return transaction.type === 'income' 
        ? total + transaction.amount 
        : total - transaction.amount;
    }, 0);
    
    console.log('🧮 Calculated Balance:', balance);
    return balance;
  };

  // Add fake SMS transactions (replacing hidden buttons with keyboard shortcuts)
  const addHiddenSMSTransaction = useCallback((amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: `sms_${Date.now()}_${amount}`,
      amount: amount,
      type: 'expense',
      description: description,
      category: amount === 101 ? 'food' : 'shopping',
      timestamp: new Date(),
      source: 'sms'
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    console.log(`📱 Added fake SMS transaction: ${description} - ₹${amount}`);
  }, [transactions, saveTransactions]);

  // Keyboard event listener for '\' (101) and ']' (400) - seamless and hidden
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Don't trigger when typing in input fields or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '\\') {
        e.preventDefault();
        addHiddenSMSTransaction(101, "UPI Payment");
      } else if (e.key === ']') {
        e.preventDefault();
        addHiddenSMSTransaction(400, "UPI Payment");
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [addHiddenSMSTransaction]);

  const addTransaction = (type: 'income' | 'expense', customAmount?: number, customDescription?: string, category?: string) => {
    const transactionAmount = customAmount || parseFloat(amount);
    const transactionDescription = customDescription || description || (type === 'income' ? 'Income' : 'Expense');
    
    if (!transactionAmount || isNaN(transactionAmount)) {
      alert('Please enter a valid amount');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: transactionAmount,
      type,
      description: transactionDescription,
      category: category,
      timestamp: new Date()
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Reset form
    setAmount('');
    setDescription('');
    setShowIncomeModal(false);
    setShowExpenseModal(false);
  };

  // Keep all your existing handler functions...
  const handleReceiptUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setReceiptImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setReceiptPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, []);

  const processReceipt = async () => {
    if (!receiptImage) return;

    setIsProcessingReceipt(true);
    
    try {
      const formData = new FormData();
      formData.append('image', receiptImage);
      formData.append('message', 'Please analyze this receipt and extract: amount, whether this is an expense or income, description/merchant name, and category (food, transport, shopping, etc.). Return the data in JSON format with fields: amount, type, description, category, confidence.');
      formData.append('language', 'en');
      formData.append('mode', 'receipt_analysis');

      const response = await fetch('/api/gemini-receipt', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.receiptData) {
        setExtractedReceiptData(data.receiptData);
        setShowReceiptConfirmation(true);
      } else {
        alert('Could not extract data from receipt. Please try again or add manually.');
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Error processing receipt. Please try again.');
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const confirmReceiptTransaction = () => {
    if (extractedReceiptData) {
      addTransaction(
        extractedReceiptData.type,
        extractedReceiptData.amount,
        extractedReceiptData.description,
        extractedReceiptData.category
      );
      
      // Reset receipt states
      setShowReceiptModal(false);
      setShowReceiptConfirmation(false);
      setReceiptImage(null);
      setReceiptPreview(null);
      setExtractedReceiptData(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(false);
    setIsTyping(false);
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
  // Keep all your existing utility functions...
  const handleLanguageSwitch = useCallback((language: 'en' | 'hi') => {
    setCurrentLanguage(language);
  }, []);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, []);

  const typeWriterEffect = useCallback((text: string, messageId: number) => {
    setIsTyping(true);
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      setMessages(prev => 
        prev.map(msg => 
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
    }, 10);
    
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    const messageText = inputValue.trim();
    
    if (messageText || selectedImage) {
      const newMessage: UserMessage = {
        id: Date.now(),
        text: selectedImage ? `[Image uploaded] ${messageText}` : messageText,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages([...messages, newMessage]);
      setInputValue('');
      setIsLoading(true);
      
      try {
        let response;
        
        if (selectedImage) {
          const formData = new FormData();
          formData.append('image', selectedImage);
          formData.append('message', messageText);
          formData.append('language', currentLanguage);
          
          response = await fetch('/api/gemini', {
            method: 'POST',
            body: formData
          });
          
          setSelectedImage(null);
          setImagePreview(null);
        } else {
          response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: messageText,
              language: currentLanguage
            })
          });
        }

        const data = await response.json();
        setIsLoading(false);
        
        const botMessageId = Date.now() + 1;
        const botResponse: UserMessage = {
          id: botMessageId,
          text: '',
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
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
        setMessages(prev => [...prev, errorResponse]);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasContent = inputValue.trim().length > 0 || selectedImage;

  return (
    <>
      <SignedIn>
        {/* REMOVED: Hidden demo buttons div - now using keyboard shortcuts instead */}

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

          {/* Main Content Area */}
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            {/* Fixed Top Navbar */}
            <div className="sticky top-0 z-20 flex items-center h-[9.5vh] bg-[#ecf8e5] px-8 border-b border-gray-200/50">
              <div className="flex-1" />
              
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

            {/* Scrollable Content */}
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                {/* Balance Display */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Balance Sheet</h1>
                  
                  <div className="text-center mb-8">
                    <div className="text-sm text-gray-600 mb-2">Available Balance</div>
                    <div className={`text-4xl font-bold ${calculateBalance() >= 0 ? 'text-black' : 'text-red-600'}`}>
                      {formatCurrency(calculateBalance())}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center mb-8 flex-wrap">
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-800 border-2 border-blue-300 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <IconCamera className="w-5 h-5" />
                      Add Receipt
                    </button>
                    
                    <button
                      onClick={() => setShowIncomeModal(true)}
                      className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black border-2 border-black px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <IconPlus className="w-5 h-5" />
                      Add Income
                    </button>
                    
                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <IconMinus className="w-5 h-5" />
                      Add Expense
                    </button>

                    <button
                      onClick={() => setShowResetModal(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border border-gray-300 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <IconTrash className="w-5 h-5" />
                      Reset Data
                    </button>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {transactions.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-lg font-medium mb-2">No transactions yet</p>
                        <p className="text-sm">Start by adding your first income or expense transaction.</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className={`hover:bg-gray-50 ${transaction.source === 'sms' ? 'bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-green-400' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(transaction.timestamp)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  {transaction.source === 'sms' && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-green-100 text-blue-800">
                                      📱 Auto
                                    </span>
                                  )}
                                  {transaction.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.category || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  transaction.type === 'income' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.type === 'income' ? '+' : '-'} {transaction.type}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All your existing modals remain the same... */}
        {/* Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <IconCamera className="w-5 h-5" />
                Scan Receipt
              </h3>
              
              <div className="space-y-4">
                {!receiptPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <IconUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload a receipt photo to automatically extract transaction data</p>
                    <button
                      onClick={handleReceiptUpload}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Choose Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={receiptPreview} 
                        alt="Receipt preview" 
                        className="w-full h-64 object-cover rounded-lg border"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={processReceipt}
                        disabled={isProcessingReceipt}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2 px-4 rounded-md font-semibold flex items-center justify-center gap-2"
                      >
                        {isProcessingReceipt ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <IconBrain className="w-4 h-4" />
                            Process Receipt
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleReceiptUpload}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-semibold"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setReceiptImage(null);
                    setReceiptPreview(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Confirmation Modal */}
        {showReceiptConfirmation && extractedReceiptData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <IconReceipt className="w-5 h-5" />
                Confirm Transaction
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Extracted from receipt:</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span className={extractedReceiptData.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {extractedReceiptData.type === 'income' ? '+' : '-'}{formatCurrency(extractedReceiptData.amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        extractedReceiptData.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {extractedReceiptData.type}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Description:</span>
                      <span className="text-right">{extractedReceiptData.description}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{extractedReceiptData.category}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Confidence:</span>
                      <span className="text-blue-600">{Math.round(extractedReceiptData.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmReceiptTransaction}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-semibold"
                >
                  Add Transaction
                </button>
                
                <button
                  onClick={() => {
                    setShowReceiptConfirmation(false);
                    setExtractedReceiptData(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Income Modal */}
        {showIncomeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Income</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Salary, Freelance, etc."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => addTransaction('income')}
                  className="flex-1 bg-white-600 hover:bg-gray-100 text-black py-2 px-4 rounded-md font-semibold"
                >
                  Add Income
                </button>
                <button
                  onClick={() => {
                    setShowIncomeModal(false);
                    setAmount('');
                    setDescription('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Food, Transport, etc."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => addTransaction('expense')}
                  className="flex-1 bg-gray-900 hover:bg-black text-white py-2 px-4 rounded-md font-semibold"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    setAmount('');
                    setDescription('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Data Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <IconTrash className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Reset All Data</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete all your transaction data? This action cannot be undone and will:
              </p>
              
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Delete all income and expense records</li>
                <li>• Reset your balance to ₹0</li>
                <li>• Clear all transaction history</li>
              </ul>
              
              <div className="flex gap-3">
                <button
                  onClick={resetAllData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-semibold"
                >
                  Yes, Reset All Data
                </button>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
