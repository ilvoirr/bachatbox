"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef, type KeyboardEvent, useCallback } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
import {
  IconPlus,
  IconMinus,
  IconTrash,
  IconCamera,
  IconUpload,
  IconBrain,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// --- Types ---
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

// --- Custom Minimalist Architecture SVGs (Nuclear Anti-Shrink Fix) ---
// By hardcoding width/height inline AND passing style objects, Flexbox cannot squish them during the Framer Motion animation.
const MinimalSVG = ({ children, className }: any) => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="square" 
    strokeLinejoin="miter" 
    className={cn("shrink-0 flex-none block", className)}
    style={{ minWidth: 18, minHeight: 18, maxWidth: 18, maxHeight: 18 }}
  >
    {children}
  </svg>
);

const SysLedger = ({ c }: any) => <MinimalSVG className={c}><rect x="4" y="4" width="16" height="16" /><line x1="4" y1="10" x2="20" y2="10" /></MinimalSVG>;
const SysChart  = ({ c }: any) => <MinimalSVG className={c}><line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/></MinimalSVG>;
const SysAI     = ({ c }: any) => <MinimalSVG className={c}><polygon points="12 2 22 12 12 22 2 12 12 2"/></MinimalSVG>;
const SysBot    = ({ c }: any) => <MinimalSVG className={c}><polyline points="4 7 10 12 4 17"/><line x1="12" y1="19" x2="20" y2="19"/></MinimalSVG>;
const SysSim    = ({ c }: any) => <MinimalSVG className={c}><circle cx="12" cy="12" r="6"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></MinimalSVG>;
const SysSplit  = ({ c }: any) => <MinimalSVG className={c}><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></MinimalSVG>;
const SysReads  = ({ c }: any) => <MinimalSVG className={c}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></MinimalSVG>;
const SysStock  = ({ c }: any) => <MinimalSVG className={c}><polyline points="22 6 12 16 8 12 2 18"/><polyline points="16 6 22 6 22 12"/></MinimalSVG>;
const SysRadar  = ({ c }: any) => <MinimalSVG className={c}><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="2"/></MinimalSVG>;

// --- Highly Refined Typography Logos ---
// Smaller, confident sizing. Perfectly aligned horizontally to prevent jitter.
const LogoText = ({ isDark }: { isDark: boolean }) => (
  <div className="relative z-20 flex items-center overflow-hidden">
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${libreBaskerville.className} text-[1.1rem] tracking-tight whitespace-nowrap transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}
    >
      Bachat<span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>Box.</span>
    </motion.span>
  </div>
);

const LogoTextIcon = ({ isDark }: { isDark: boolean }) => (
  <div className="relative z-20 w-full flex items-center justify-center -ml-0.5">
    <span className={`${libreBaskerville.className} text-[1.1rem] transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
      B<span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>.</span>
    </span>
  </div>
);

export default function AppPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);

  // --- UI State ---
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Logic State ---
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [extractedReceiptData, setExtractedReceiptData] = useState<ReceiptData | null>(null);
  const [showReceiptConfirmation, setShowReceiptConfirmation] = useState(false);

  // --- Local Storage Functions ---
  const getStorageKey = () => user?.id ? `bachatbox_${user.id}_transactions` : null;

  const saveTransactions = (newTransactions: Transaction[]) => {
    const key = getStorageKey();
    if (key) localStorage.setItem(key, JSON.stringify(newTransactions));
  };

  const loadTransactions = () => {
    const key = getStorageKey();
    if (key) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) }));
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

  useEffect(() => {
    if (isLoaded && user?.id) {
      setTransactions(loadTransactions());
    }
  }, [isLoaded, user?.id]);

  const calculateBalance = () => {
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
    }, 0);
  };

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
  }, [transactions]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === '\\') { e.preventDefault(); addHiddenSMSTransaction(101, "UPI Payment"); } 
      else if (e.key === ']') { e.preventDefault(); addHiddenSMSTransaction(400, "UPI Payment"); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

    setAmount('');
    setDescription('');
    setShowIncomeModal(false);
    setShowExpenseModal(false);
  };

  const handleReceiptUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setReceiptImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setReceiptPreview(e.target?.result as string);
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
      formData.append('message', 'Extract: amount, type (expense/income), description, category. Return JSON: amount, type, description, category, confidence.');
      formData.append('language', 'en');
      formData.append('mode', 'receipt_analysis');

      const response = await fetch('/api/gemini-receipt', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (data.receiptData) {
        setExtractedReceiptData(data.receiptData);
        setShowReceiptConfirmation(true);
      } else {
        alert('Could not extract data from receipt. Please add manually.');
      }
    } catch (error) {
      alert('Error processing receipt.');
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const confirmReceiptTransaction = () => {
    if (extractedReceiptData) {
      addTransaction(extractedReceiptData.type, extractedReceiptData.amount, extractedReceiptData.description, extractedReceiptData.category);
      setShowReceiptModal(false);
      setShowReceiptConfirmation(false);
      setReceiptImage(null);
      setReceiptPreview(null);
      setExtractedReceiptData(null);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const formatDate = (date: Date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + '  |  ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // --- Dynamic Theme Classes ---
  const tBg = isDark ? "bg-[#020805]" : "bg-[#F7F6F2]";
  const tTextMain = isDark ? "text-neutral-200" : "text-neutral-900";
  const tTextSub = isDark ? "text-neutral-500" : "text-neutral-500";
  const tBorder = isDark ? "border-white/[0.05]" : "border-black/[0.08]";
  const tAccent = isDark ? "text-emerald-400" : "text-emerald-800";
  const tAccentBg = isDark ? "bg-emerald-950/20" : "bg-emerald-800/5";
  const tAccentBorder = isDark ? "border-emerald-500/30" : "border-emerald-800/20";
  const tHoverAccent = isDark ? "hover:border-emerald-400/50 hover:bg-emerald-900/40" : "hover:border-emerald-800/40 hover:bg-emerald-800/10";
  const tSelection = isDark ? "selection:bg-emerald-300 selection:text-emerald-950" : "selection:bg-emerald-800 selection:text-[#F7F6F2]";

  // --- Sidebar Configuration ---
  const getIconClass = () => `transition-colors duration-300 ${isDark ? 'text-neutral-500 group-hover:text-emerald-400' : 'text-neutral-500 group-hover:text-emerald-800'}`;
  
  // Guard wrapper for absolute stability
  const IconGuard = ({ children }: { children: React.ReactNode }) => (
    <div className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] flex items-center justify-center shrink-0 flex-none overflow-visible">
      {children}
    </div>
  );
  
  const links = [
    { label: "Balance Sheet", href: "/apppage", icon: <IconGuard><SysLedger c={getIconClass()} /></IconGuard>, onClick: () => router.push('/apppage') },
    { label: "Visualise Stats", href: "/visualise", icon: <IconGuard><SysChart c={getIconClass()} /></IconGuard>, onClick: () => router.push('/visualise') },
    { label: "AI Dashboard", href: "/advice", icon: <IconGuard><SysAI c={getIconClass()} /></IconGuard>, onClick: () => router.push('/advice') },
    { label: "BudgetBot", href: "/chatbot", icon: <IconGuard><SysBot c={getIconClass()} /></IconGuard>, onClick: () => router.push('/chatbot') },
    { label: "What-If Simulator", href: "/simulator", icon: <IconGuard><SysSim c={getIconClass()} /></IconGuard>, onClick: () => router.push('/simulator') },
    { label: "SplitWise", href: "/splitwise", icon: <IconGuard><SysSplit c={getIconClass()} /></IconGuard>, onClick: () => router.push('/splitwise') },
    { label: "Financial Reads", href: "/financial-reads", icon: <IconGuard><SysReads c={getIconClass()} /></IconGuard>, onClick: () => router.push('/financial-reads') },
    { label: "Stock Market", href: "/investment", icon: <IconGuard><SysStock c={getIconClass()} /></IconGuard>, onClick: () => router.push('/investment') },
    { label: "Claim Radar", href: "/claimradar", icon: <IconGuard><SysRadar c={getIconClass()} /></IconGuard>, onClick: () => router.push('/claimradar') },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />

      <SignedIn>
        <div className={`min-h-screen transition-colors duration-500 ${tBg} ${tTextMain} ${tSelection} font-sans relative flex`}>
          
          {/* Subtle Noise overlay adapting to theme */}
          <div 
            className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-[0.03] mix-blend-screen' : 'opacity-[0.04] mix-blend-multiply'}`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
          />

          {/* Fixed Sidebar */}
          <div className={`fixed top-0 left-0 h-screen z-40 border-r transition-colors duration-500 ${tBorder}`}
               onMouseEnter={() => setSidebarOpen(true)}
               onMouseLeave={() => setSidebarOpen(false)}>
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
              <SidebarBody className={`justify-between gap-8 h-full border-r transition-colors duration-500 py-6 px-4 ${isDark ? 'bg-[#020805]/95 border-white/[0.05]' : 'bg-[#F7F6F2]/95 border-black/[0.05]'} backdrop-blur-xl`}>
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                  
                  {/* Clean Minimalist Typographic Header */}
                  <div className="h-12 flex items-center shrink-0 w-full mb-8 cursor-pointer pl-1">
                    {sidebarOpen ? <LogoText isDark={isDark} /> : <LogoTextIcon isDark={isDark} />}
                  </div>

                  <div className="flex flex-col gap-4 pl-1">
                    {links.map((link, idx) => (
                      <div key={idx} onClick={link.onClick} className="cursor-pointer group flex items-center">
                        <SidebarLink 
                           link={link} 
                           className={`transition-colors font-mono text-[10px] tracking-[0.15em] uppercase ${isDark ? 'text-neutral-400 group-hover:text-emerald-300' : 'text-neutral-500 group-hover:text-emerald-800'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* User Profile Box - Strictly Sized */}
                <div className="mb-2 pl-1">
                  <SidebarLink
                    link={{
                      label: user?.username || 'User',
                      href: "#",
                      icon: (
                        <div className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] flex items-center justify-center shrink-0 flex-none">
                           <div className={`h-[22px] w-[22px] shrink-0 border flex items-center justify-center text-[9px] font-mono uppercase transition-colors duration-500 ${isDark ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400' : 'border-emerald-800/30 bg-emerald-800/10 text-emerald-800'}`}>
                             {(user?.username?.[0] || user?.firstName?.[0] || 'U').toUpperCase()}
                           </div>
                        </div>
                      ),
                    }}
                    className={isDark ? "text-neutral-400 font-mono text-[10px] tracking-widest uppercase" : "text-neutral-600 font-mono text-[10px] tracking-widest uppercase"}
                  />
                </div>
              </SidebarBody>
            </Sidebar>
          </div>

          {/* Main Content Area */}
          <div className={cn(
            "transition-all duration-300 ease-in-out flex-1 flex flex-col relative z-10",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            
            {/* Topbar */}
            <header className={`sticky top-0 z-30 flex items-center justify-between h-20 px-8 md:px-12 backdrop-blur-md border-b transition-colors duration-500 ${isDark ? 'bg-[#020805]/80 border-white/[0.03]' : 'bg-[#F7F6F2]/80 border-black/[0.05]'}`}>
              <div className={`ml-4 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase transition-colors duration-500 ${isDark ? 'text-emerald-500/70' : 'text-emerald-800/70'}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDark ? 'bg-emerald-500' : 'bg-emerald-700'}`}></span>
                </span>
                Active Ledger
              </div>
              
              <div className="flex items-center gap-6">
                {/* Theme Toggle - Geometric Dot */}
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className="relative group w-6 h-6 flex items-center justify-center focus:outline-none"
                  aria-label="Toggle Theme"
                >
                  <div className={`w-2 h-2 transition-all duration-500 rounded-full ${isDark ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-transparent border-[1.5px] border-emerald-800 scale-[1.2]'}`} />
                  <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isDark ? 'bg-emerald-400/0 group-hover:bg-emerald-400/10' : 'bg-emerald-800/0 group-hover:bg-emerald-800/5'}`} />
                </button>

                {/* User Dropdown Trigger */}
                <div
                  className={`group relative cursor-pointer inline-flex items-center gap-3 border px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${tAccentBorder} ${tAccentBg} ${isDark ? 'hover:bg-emerald-900/20 text-emerald-300' : 'hover:bg-emerald-800/10 text-emerald-800'}`}
                  onClick={() => triggerRef.current?.querySelector('button')?.click()}
                >
                  <span>{user?.username || 'User'}</span>
                  <div ref={triggerRef} className="relative opacity-80 mix-blend-luminosity scale-90">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{ elements: { userButtonPopoverCard: { transform: 'translateY(1.5rem)' } } }}
                    />
                  </div>
                  <div className={`absolute inset-0 border transition-all duration-300 ${isDark ? 'border-emerald-400/0 group-hover:border-emerald-400/30' : 'border-emerald-800/0 group-hover:border-emerald-800/30'}`} />
                </div>
              </div>
            </header>

            {/* Scrollable Main Content */}
            <main className="flex-1 p-8 md:p-12">
              <div className="max-w-5xl mx-auto space-y-12">
                
                {/* Header Section */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b transition-colors duration-500 ${tBorder}`}>
                  <div>
                    <p className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-4 transition-colors duration-500 ${isDark ? 'text-emerald-400/60' : 'text-emerald-800/60'}`}>
                      Current Capital Assessment
                    </p>
                    <h1 className={`${libreBaskerville.className} text-4xl md:text-5xl tracking-tighter mix-blend-normal`}>
                      Available <span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Balance.</span>
                    </h1>
                  </div>

                  <div className="text-right">
                    <div className={`text-4xl md:text-5xl font-light tracking-tight transition-colors duration-500 ${calculateBalance() >= 0 ? tTextMain : 'text-rose-500'}`}>
                      {formatCurrency(calculateBalance())}
                    </div>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={() => setShowReceiptModal(true)} className={`group relative h-12 overflow-hidden border text-[10px] font-mono uppercase tracking-[0.15em] flex items-center justify-center transition-all backdrop-blur-md ${tAccentBg} ${tAccentBorder} ${tAccent} ${tHoverAccent}`}>
                    <IconCamera size={16} stroke={1.2} className="mr-2 opacity-80" /> SCAN RECEIPT
                    <div className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent group-hover:animate-[sweep_1s_ease-in-out_infinite] ${isDark ? 'via-emerald-400/10' : 'via-emerald-800/10'}`} />
                  </button>

                  <button onClick={() => setShowIncomeModal(true)} className={`group relative h-12 overflow-hidden border text-[10px] font-mono uppercase tracking-[0.15em] flex items-center justify-center transition-all backdrop-blur-md ${tAccentBg} ${tAccentBorder} ${tAccent} ${tHoverAccent}`}>
                    <IconPlus size={16} stroke={1.2} className="mr-2 opacity-80" /> ADD INCOME
                    <div className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent group-hover:animate-[sweep_1s_ease-in-out_infinite] ${isDark ? 'via-emerald-400/10' : 'via-emerald-800/10'}`} />
                  </button>

                  <button onClick={() => setShowExpenseModal(true)} className={`group relative h-12 overflow-hidden border transition-all bg-transparent backdrop-blur-sm text-[10px] font-mono uppercase tracking-[0.15em] flex items-center justify-center ${isDark ? 'border-white/[0.05] hover:border-rose-500/30 text-neutral-400 hover:text-rose-300' : 'border-black/[0.08] hover:border-rose-700/30 text-neutral-600 hover:text-rose-700'}`}>
                    <IconMinus size={16} stroke={1.2} className="mr-2 opacity-80" /> ADD EXPENSE
                  </button>

                  <button onClick={() => setShowResetModal(true)} className={`group relative h-12 overflow-hidden border transition-all bg-transparent backdrop-blur-sm text-[10px] font-mono uppercase tracking-[0.15em] flex items-center justify-center ${isDark ? 'border-white/[0.05] hover:border-white/20 text-neutral-500 hover:text-white' : 'border-black/[0.08] hover:border-black/20 text-neutral-500 hover:text-black'}`}>
                    <IconTrash size={16} stroke={1.2} className="mr-2 opacity-80" /> RESET LEDGER
                  </button>
                </div>

                {/* Ledger Table */}
                <div>
                  <h2 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-4 flex items-center gap-2 transition-colors duration-500 ${tTextSub}`}>
                    <div className={`w-1.5 h-1.5 bg-current opacity-50`} />
                    Transaction Registry
                  </h2>
                  
                  <div className={`border transition-colors duration-500 ${tBorder} ${isDark ? 'bg-[#020805]/50' : 'bg-white/40'} backdrop-blur-sm relative`}>
                    {transactions.length === 0 ? (
                      <div className={`p-12 text-center font-mono text-xs uppercase tracking-widest ${tTextSub}`}>
                        <p>No records found in current ledger.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className={`border-b transition-colors duration-500 ${tBorder}`}>
                              <th className={`px-6 py-4 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap ${tTextSub}`}>Timestamp</th>
                              <th className={`px-6 py-4 text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Descriptor</th>
                              <th className={`px-6 py-4 text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Class</th>
                              <th className={`px-6 py-4 text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Vector</th>
                              <th className={`px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-right ${tTextSub}`}>Value</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y transition-colors duration-500 ${isDark ? 'divide-white/[0.02]' : 'divide-black/[0.04]'}`}>
                            {transactions.map((transaction) => (
                              <tr key={transaction.id} className={`transition-colors duration-300 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'} ${transaction.source === 'sms' ? (isDark ? 'bg-emerald-950/10 border-l border-emerald-500/50' : 'bg-emerald-800/5 border-l border-emerald-800/50') : ''}`}>
                                <td className={`px-6 py-4 whitespace-nowrap text-[11px] font-mono tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                  {formatDate(transaction.timestamp)}
                                </td>
                                <td className={`px-6 py-4 text-sm ${tTextMain}`}>
                                  <div className="flex items-center gap-3">
                                    {transaction.source === 'sms' && (
                                      <span className={`inline-flex items-center border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${isDark ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30' : 'border-emerald-800/30 text-emerald-800 bg-emerald-800/10'}`}>
                                        AUTO_SYNC
                                      </span>
                                    )}
                                    {transaction.description}
                                  </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-xs font-mono uppercase ${tTextSub}`}>
                                  {transaction.category || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${
                                    transaction.type === 'income' 
                                      ? (isDark ? 'text-emerald-400' : 'text-emerald-700') 
                                      : tTextSub
                                  }`}>
                                    {transaction.type === 'income' ? <IconPlus size={10} stroke={1.5}/> : <IconMinus size={10} stroke={1.5}/>}
                                    {transaction.type}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-mono tracking-tight ${
                                  transaction.type === 'income' ? (isDark ? 'text-emerald-300' : 'text-emerald-800') : tTextMain
                                }`}>
                                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </main>
          </div>
        </div>
{/* --- MODALS OVERLAY --- */}
        <AnimatePresence mode="wait">
          {showReceiptModal && (
            <motion.div 
              key="receipt-modal" // Unique Key added
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans ${isDark ? 'bg-[#020805]/90' : 'bg-[#F7F6F2]/90'}`}
            >
              <div className={`border shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#020805] border-emerald-500/20' : 'bg-[#F7F6F2] border-emerald-800/20'}`}>
                <h3 className={`text-xs font-mono uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${tAccent}`}>
                  <IconCamera className="w-4 h-4" stroke={1.2} /> Scan Receipt Data
                </h3>
                
                <div className="space-y-6">
                  {!receiptPreview ? (
                    <div className={`border border-dashed transition-colors p-10 text-center cursor-pointer group ${isDark ? 'border-white/[0.1] hover:border-emerald-500/30' : 'border-black/[0.15] hover:border-emerald-800/30'}`} onClick={handleReceiptUpload}>
                      <IconUpload className={`w-8 h-8 mx-auto mb-4 transition-colors ${isDark ? 'text-neutral-500 group-hover:text-emerald-400' : 'text-neutral-400 group-hover:text-emerald-800'}`} stroke={1.2} />
                      <p className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${tTextSub}`}>Click to select image file</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className={`relative border p-1 ${isDark ? 'border-white/[0.05] bg-white/[0.01]' : 'border-black/[0.05] bg-black/[0.02]'}`}>
                        <img src={receiptPreview} alt="Receipt preview" className={`w-full h-64 object-cover filter ${isDark ? 'grayscale opacity-80' : 'sepia-[0.2]'}`} />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button onClick={processReceipt} disabled={isProcessingReceipt} className={`relative w-full h-12 border text-[10px] font-mono uppercase tracking-[0.15em] flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${tAccentBg} ${tAccentBorder} ${tAccent} ${tHoverAccent}`}>
                          {isProcessingReceipt ? <span className="animate-pulse">ANALYZING DATA...</span> : <> EXECUTE EXTRACTION</>}
                        </button>
                        <button onClick={handleReceiptUpload} className={`w-full h-12 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-white/[0.05] text-neutral-400 hover:text-white' : 'border-black/[0.08] text-neutral-600 hover:text-black'}`}>
                          RESELECT IMAGE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`mt-6 pt-6 border-t ${tBorder}`}>
                  <button onClick={() => { setShowReceiptModal(false); setReceiptImage(null); setReceiptPreview(null); }} className={`w-full text-[10px] font-mono uppercase tracking-widest transition-colors ${isDark ? 'text-neutral-500 hover:text-rose-400' : 'text-neutral-500 hover:text-rose-600'}`}>
                    [ Terminate Process ]
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Receipt Confirmation Modal */}
          {showReceiptConfirmation && extractedReceiptData && (
            <motion.div 
              key="confirmation-modal" // Unique Key added
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans ${isDark ? 'bg-[#020805]/90' : 'bg-[#F7F6F2]/90'}`}
            >
              <div className={`border shadow-2xl p-8 w-full max-w-md ${isDark ? 'bg-[#020805] border-emerald-500/20' : 'bg-[#F7F6F2] border-emerald-800/20'}`}>
                <h3 className={`text-xs font-mono uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${tAccent}`}>
                  <IconBrain className="w-4 h-4" stroke={1.2} /> Verify Extraction
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className={`flex justify-between items-center pb-2 border-b ${tBorder}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Amount</span>
                    <span className={`font-mono text-sm ${extractedReceiptData.type === 'income' ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-rose-400' : 'text-rose-700')}`}>
                      {extractedReceiptData.type === 'income' ? '+' : '-'}{formatCurrency(extractedReceiptData.amount)}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center pb-2 border-b ${tBorder}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Type</span>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextMain}`}>{extractedReceiptData.type}</span>
                  </div>
                  <div className={`flex justify-between items-center pb-2 border-b ${tBorder}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Descriptor</span>
                    <span className={`text-[11px] font-mono text-right max-w-[60%] truncate ${tTextMain}`}>{extractedReceiptData.description}</span>
                  </div>
                  <div className={`flex justify-between items-center pb-2 border-b ${tBorder}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Class</span>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextMain}`}>{extractedReceiptData.category}</span>
                  </div>
                  <div className={`flex justify-between items-center pb-2 border-b ${tBorder}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Confidence</span>
                    <span className={`text-[10px] font-mono tracking-widest ${isDark ? 'text-emerald-400/80' : 'text-emerald-800/80'}`}>{Math.round(extractedReceiptData.confidence * 100)}%</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmReceiptTransaction}
                    className={`w-full h-12 font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${isDark ? 'bg-emerald-500 text-[#020805] hover:bg-emerald-400' : 'bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700'}`}
                  >
                    COMMIT RECORD
                  </button>
                  <button
                    onClick={() => { setShowReceiptConfirmation(false); setExtractedReceiptData(null); }}
                    className={`w-full h-12 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-white/[0.05] text-neutral-400 hover:text-white' : 'border-black/[0.08] text-neutral-600 hover:text-black'}`}
                  >
                    DISCARD
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Income/Expense Modals */}
          {(showIncomeModal || showExpenseModal) && (
            <motion.div 
              key="transaction-modal" // Unique Key added
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans ${isDark ? 'bg-[#020805]/90' : 'bg-[#F7F6F2]/90'}`}
            >
              <div className={`border shadow-2xl p-8 w-full max-w-md ${isDark ? 'bg-[#020805] border-emerald-500/20' : 'bg-[#F7F6F2] border-emerald-800/20'}`}>
                <h3 className={`text-xs font-mono uppercase tracking-[0.2em] mb-8 flex items-center gap-3 ${showExpenseModal ? (isDark ? 'text-rose-400' : 'text-rose-700') : tAccent}`}>
                  {showIncomeModal ? <IconPlus className="w-4 h-4" stroke={1.2} /> : <IconMinus className="w-4 h-4" stroke={1.2} />}
                  <span>Register {showIncomeModal ? 'Capital' : 'Deficit'}</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Value (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50 placeholder:text-neutral-700' : 'border-black/[0.15] text-black focus:border-emerald-800/50 placeholder:text-neutral-400'}`}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Descriptor Tag</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50 placeholder:text-neutral-700' : 'border-black/[0.15] text-black focus:border-emerald-800/50 placeholder:text-neutral-400'}`}
                      placeholder="e.g. Contract, Transit..."
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-8">
                  <button
                    onClick={() => addTransaction(showIncomeModal ? 'income' : 'expense')}
                    className={`w-full h-12 font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${
                      showIncomeModal 
                      ? (isDark ? 'bg-emerald-500 text-[#020805] hover:bg-emerald-400' : 'bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700')
                      : (isDark ? 'bg-white text-[#020805] hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800')
                    }`}
                  >
                    EXECUTE TRANSACTION
                  </button>
                  <button
                    onClick={() => { setShowIncomeModal(false); setShowExpenseModal(false); setAmount(''); setDescription(''); }}
                    className={`w-full h-12 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-white/[0.05] text-neutral-400 hover:text-white' : 'border-black/[0.08] text-neutral-600 hover:text-black'}`}
                  >
                    ABORT
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reset Modal */}
          {showResetModal && (
            <motion.div 
              key="reset-modal" // Unique Key added
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans ${isDark ? 'bg-[#020805]/90' : 'bg-[#F7F6F2]/90'}`}
            >
              <div className={`border shadow-2xl p-8 w-full max-w-md ${isDark ? 'bg-[#020805] border-rose-500/20' : 'bg-[#F7F6F2] border-rose-700/20'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <IconTrash className={`w-4 h-4 ${isDark ? 'text-rose-500' : 'text-rose-700'}`} stroke={1.2} />
                  <h3 className={`text-xs font-mono uppercase tracking-[0.2em] ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>Purge Data Storage</h3>
                </div>
                
                <p className={`text-[11px] font-mono mb-6 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  WARNING: Initiating protocol will irrevocably erase all local ledger records, zeroing the capital assessment.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button onClick={resetAllData} className={`w-full h-12 border font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition-all ${isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-[#020805]' : 'bg-rose-700/10 border-rose-700/30 text-rose-700 hover:bg-rose-700 hover:text-white'}`}>
                    CONFIRM PURGE
                  </button>
                  <button onClick={() => setShowResetModal(false)} className={`w-full h-12 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-white/[0.05] text-neutral-400 hover:text-white' : 'border-black/[0.08] text-neutral-600 hover:text-black'}`}>
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}