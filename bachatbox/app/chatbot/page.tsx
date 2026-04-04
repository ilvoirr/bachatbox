"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef, type KeyboardEvent, useCallback } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
import {
  IconSend,
  IconRefresh,
  IconActivity,
  IconChartBar
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

// --- Custom Minimalist Architecture SVGs ---
const MinimalSVG = ({ children, className }: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter" className={cn("shrink-0 flex-none block", className)} style={{ minWidth: 18, minHeight: 18, maxWidth: 18, maxHeight: 18 }}>
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

// --- Logos ---
const LogoText = ({ isDark }: { isDark: boolean }) => (
  <div className="relative z-20 flex items-center overflow-hidden">
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${libreBaskerville.className} text-[1.1rem] tracking-tight whitespace-nowrap transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
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

export default function ChatbotPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Logic State
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const getStorageKey = (): string | null => user?.id ? `bachatbox_${user.id}_transactions` : null;

  const loadTransactions = (): Transaction[] => {
    const key = getStorageKey();
    if (key) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) }));
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

  useEffect(() => {
    if (isLoaded && user && messages.length === 0) {
      const welcomeMessage: UserMessage = {
        id: Date.now(),
        text: currentLanguage === 'hi' 
          ? "नमस्ते! मैं BudgetBot हूँ, आपका व्यक्तिगत वित्तीय सलाहकार। मैं आपके खर्चों और आय के डेटा के आधार पर आपको बेहतर वित्तीय सलाह दे सकता हूँ। आप मुझसे बजट, बचत, निवेश या अपनी वित्तीय आदतों के बारे में कुछ भी पूछ सकते हैं!"
          : "System online. I am BudgetBot, your autonomous financial analyst. I synthesize your ledger data to provide strategic insights. Inquire about budgeting, optimization, or market habits.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isLoaded, user, currentLanguage]);

  const calculateFinancialSummary = (): FinancialSummary => {
    const transactions = loadTransactions();
    const totalIncome = transactions.filter((t: Transaction) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t: Transaction) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
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

    return { totalIncome, totalExpense, balance, expenseCategories, recentTransactions, transactionCount: transactions.length };
  };

  const handleLanguageSwitch = useCallback((language: 'en' | 'hi') => {
    setCurrentLanguage(language);
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
    setIsTyping(false);
    
    setTimeout(() => {
      const welcomeMessage: UserMessage = {
        id: Date.now(),
        text: currentLanguage === 'hi' 
          ? "नया संवाद आरंभ हुआ। मैं आपकी वित्तीय सहायता के लिए तैयार हूँ। आप मुझसे क्या पूछना चाहते हैं?"
          : "Protocol refreshed. Terminal ready for new inquiries. What would you like to analyze?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  const typeWriterEffect = useCallback((text: string, messageId: number) => {
    setIsTyping(true);
    let currentIndex = 0;
    const interval = setInterval(() => {
      setMessages((prev: UserMessage[]) => 
        prev.map((msg: UserMessage) => 
          msg.id === messageId ? { ...msg, text: text.slice(0, currentIndex + 1) } : msg
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
      const newMessage: UserMessage = { id: Date.now(), text: messageText, sender: 'user', timestamp: new Date() };
      setMessages((prev: UserMessage[]) => [...prev, newMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const financialData = calculateFinancialSummary();
        const response = await fetch('/api/gemini-financial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, language: currentLanguage, financialData, userId: user?.id })
        });
        const data = await response.json();
        setIsLoading(false);
        
        const botMessageId = Date.now() + 1;
        const botResponse: UserMessage = { id: botMessageId, text: '', sender: 'bot', timestamp: new Date() };
        
        setMessages((prev: UserMessage[]) => [...prev, botResponse]);
        typeWriterEffect(data.message, botMessageId);
      } catch (error) {
        setIsLoading(false);
        const errorResponse: UserMessage = {
          id: Date.now() + 1,
          text: currentLanguage === 'hi' 
            ? "क्षमा करें, कनेक्शन में समस्या है। कृपया फिर से कोशिश करें।"
            : "Network error. Unable to synthesize response. Please attempt again.",
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
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Theme Variables ---
  const tBg = isDark ? "bg-[#020805]" : "bg-[#F7F6F2]";
  const tTextMain = isDark ? "text-neutral-200" : "text-neutral-900";
  const tTextSub = isDark ? "text-neutral-500" : "text-neutral-500";
  const tBorder = isDark ? "border-white/[0.05]" : "border-black/[0.08]";
  const tAccentBorder = isDark ? "border-emerald-500/30" : "border-emerald-800/20";
  const tSelection = isDark ? "selection:bg-emerald-300 selection:text-emerald-950" : "selection:bg-emerald-800 selection:text-[#F7F6F2]";

  const getIconClass = () => `transition-colors duration-300 ${isDark ? 'text-neutral-500 group-hover:text-emerald-400' : 'text-neutral-500 group-hover:text-emerald-800'}`;
  
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

  // Sleek Typing Indicator
  const LuxuryTypingIndicator = () => (
    <div className={`flex justify-start mb-6`}>
      <div className={`px-6 py-4 border max-w-[85%] md:max-w-[70%] transition-colors duration-500 ${isDark ? 'border-white/[0.05] bg-white/[0.01]' : 'border-black/[0.05] bg-black/[0.01]'}`}>
        <div className="flex items-center gap-3">
          <IconActivity className={`w-4 h-4 animate-pulse ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`} stroke={1.5} />
          <span className={`text-[10px] font-mono uppercase tracking-widest animate-pulse ${tTextSub}`}>
            Synthesizing response...
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SignedIn>
        {/* Full Desktop Lock */}
        <div className={`h-screen overflow-hidden transition-colors duration-500 ${tBg} ${tTextMain} ${tSelection} font-sans relative flex`}>
          
          {/* Subtle Noise overlay */}
          <div 
            className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-[0.03] mix-blend-screen' : 'opacity-[0.04] mix-blend-multiply'}`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
          />

          {/* Glassmorphic Sidebar */}
          <div className={`fixed top-0 left-0 h-screen z-40 border-r transition-colors duration-500 ${tBorder}`}
               onMouseEnter={() => setSidebarOpen(true)}
               onMouseLeave={() => setSidebarOpen(false)}>
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
              <SidebarBody className={`justify-between gap-8 h-full border-r transition-colors duration-500 py-6 px-4 ${isDark ? 'bg-[#020805]/95 border-white/[0.05]' : 'bg-[#F7F6F2]/95 border-black/[0.05]'} backdrop-blur-xl`}>
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
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
            "transition-all duration-300 ease-in-out flex-1 flex flex-col relative z-10 h-full",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            
            {/* Glassmorphic Topbar */}
            <header className={`shrink-0 flex items-center justify-between h-20 px-8 md:px-12 backdrop-blur-md border-b transition-colors duration-500 z-20 ${isDark ? 'bg-[#020805]/80 border-white/[0.03]' : 'bg-[#F7F6F2]/80 border-black/[0.05]'}`}>
              <div className={`ml-4 flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase transition-colors duration-500 ${isDark ? 'text-emerald-500/70' : 'text-emerald-800/70'}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDark ? 'bg-emerald-500' : 'bg-emerald-700'}`}></span>
                </span>
                BudgetBot Terminal
              </div>
              
              <div className="flex items-center gap-4 md:gap-6">
                
                {/* Language Switcher */}
                <div className={`hidden md:flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors ${tTextSub}`}>
                  <button onClick={() => handleLanguageSwitch('en')} className={`transition-colors hover:text-emerald-500 ${currentLanguage === 'en' ? tTextMain : ''}`}>EN</button>
                  <span>/</span>
                  <button onClick={() => handleLanguageSwitch('hi')} className={`transition-colors hover:text-emerald-500 ${currentLanguage === 'hi' ? tTextMain : ''}`}>HI</button>
                </div>

                {/* New Chat Button */}
                <button onClick={handleNewChat} className={`group flex items-center gap-2 border px-4 py-2 text-[10px] font-mono tracking-[0.15em] uppercase transition-all ${tBorder} ${isDark ? 'hover:bg-white/[0.02] text-neutral-400 hover:text-white' : 'hover:bg-black/[0.02] text-neutral-600 hover:text-black'}`}>
                   <IconRefresh className="w-3.5 h-3.5" stroke={1.2} /> <span className="hidden md:inline">CLEAR SYNC</span>
                </button>

                {/* Theme Toggle */}
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className="relative group w-6 h-6 flex items-center justify-center focus:outline-none ml-2"
                  aria-label="Toggle Theme"
                >
                  <div className={`w-2 h-2 transition-all duration-500 rounded-full ${isDark ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-transparent border-[1.5px] border-emerald-800 scale-[1.2]'}`} />
                  <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isDark ? 'bg-emerald-400/0 group-hover:bg-emerald-400/10' : 'bg-emerald-800/0 group-hover:bg-emerald-800/5'}`} />
                </button>

                {/* User Dropdown */}
                <div
                  className={`group relative cursor-pointer inline-flex items-center gap-3 border px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${tAccentBorder} ${isDark ? 'bg-emerald-950/20 hover:bg-emerald-900/20 text-emerald-300' : 'bg-emerald-800/5 hover:bg-emerald-800/10 text-emerald-800'}`}
                  onClick={() => triggerRef.current?.querySelector('button')?.click()}
                >
                  <span>{user?.username || 'User'}</span>
                  <div ref={triggerRef} className="relative opacity-80 mix-blend-luminosity scale-90">
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonPopoverCard: { transform: 'translateY(1.5rem)' } } }} />
                  </div>
                </div>
              </div>
            </header>

            {/* Chat Interface */}
            <main className="flex-1 flex flex-col min-h-0 relative z-10 bg-transparent">
              
              {/* Scrollable Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar scroll-smooth">
                <div className="max-w-4xl mx-auto flex flex-col pb-4">
                  <AnimatePresence initial={false}>
                    {messages.map((message: UserMessage) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={message.id} 
                        className={`flex w-full mb-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender === 'user' ? (
                          // User Message - Accent Block
                          <div className={`px-6 py-4 border max-w-[85%] md:max-w-[70%] transition-colors duration-500 ${isDark ? 'border-emerald-500/30 bg-emerald-900/20 text-emerald-100' : 'border-emerald-800/30 bg-emerald-800/10 text-emerald-900'}`}>
                            <div className="text-sm md:text-base leading-relaxed">{message.text}</div>
                            <div className={`text-[9px] font-mono uppercase tracking-widest mt-3 text-right opacity-60`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        ) : (
                          // Bot Message - Sleek Glassmorphic
                          <div className={`px-6 py-4 border max-w-[85%] md:max-w-[70%] transition-colors duration-500 ${isDark ? 'border-white/[0.05] bg-white/[0.01] text-neutral-200' : 'border-black/[0.05] bg-black/[0.01] text-neutral-800'}`}>
                            <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.text}</div>
                            <div className={`text-[9px] font-mono uppercase tracking-widest mt-3 opacity-40`}>
                              {formatTime(message.timestamp)} • SYSTEM
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && <LuxuryTypingIndicator />}
                  <div ref={messagesEndRef} className="h-1" />
                </div>
              </div>

              {/* Input Area - Blurred floating bar */}
              <div className={`shrink-0 p-6 md:p-8 pt-0`}>
                <div className={`max-w-4xl mx-auto backdrop-blur-xl border transition-colors duration-500 p-2 md:p-3 flex items-end gap-3 ${isDark ? 'bg-[#020805]/80 border-white/[0.05]' : 'bg-[#F7F6F2]/80 border-black/[0.08]'}`}>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={currentLanguage === 'hi' ? "इनपुट दर्ज करें..." : "Enter query or command..."}
                    className={`flex-1 max-h-32 min-h-[44px] bg-transparent outline-none resize-none p-3 text-sm md:text-base transition-colors ${isDark ? 'text-white placeholder:text-neutral-700' : 'text-black placeholder:text-neutral-400'}`}
                    disabled={isLoading || isTyping}
                    rows={1}
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading || isTyping}
                    className={`shrink-0 h-11 w-12 flex items-center justify-center border transition-all duration-300 ${
                      inputValue.trim() && !isLoading && !isTyping
                        ? (isDark ? 'border-emerald-500 bg-emerald-500 text-[#020805] hover:bg-emerald-400 hover:border-emerald-400' : 'border-emerald-800 bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700 hover:border-emerald-700')
                        : (isDark ? 'border-white/[0.05] text-neutral-700 bg-transparent cursor-not-allowed' : 'border-black/[0.05] text-neutral-400 bg-transparent cursor-not-allowed')
                    }`}
                  >
                    <IconSend className="w-5 h-5" stroke={1.5} />
                  </button>
                </div>
                <div className={`max-w-4xl mx-auto text-center mt-3 text-[9px] font-mono uppercase tracking-[0.2em] transition-colors ${tTextSub}`}>
                  Automated financial intelligence terminal
                </div>
              </div>

            </main>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}