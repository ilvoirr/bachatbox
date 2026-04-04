"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
import {
  IconReceipt,
  IconChartBar,
  IconTable,
  IconMessageCircle,
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconSparkles,
  IconBook,
  IconTrendingUp,
  IconShieldCheck,
  IconUser
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// -------------------- Type Declarations --------------------
type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  timestamp: Date;
};

type Friend = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

type SplitExpense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitWith: string[];
  category: string;
  date: Date;
  perPersonAmount: number;
  settled: boolean;
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

export default function SplitWisePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Logic State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<SplitExpense | null>(null);

  const [friendForm, setFriendForm] = useState({ name: '', email: '' });
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    paidBy: 'You',
    splitWith: [] as string[],
    category: 'Food'
  });

  const getStorageKey = (type: 'friends' | 'splitexpenses' | 'transactions') => {
    return user?.id ? `bachatbox_${user.id}_${type}` : null;
  };

  const saveToStorage = (type: 'friends' | 'splitexpenses', data: any[]) => {
    const key = getStorageKey(type);
    if (key) localStorage.setItem(key, JSON.stringify(data));
  };

  const loadFromStorage = (type: 'friends' | 'splitexpenses' | 'transactions') => {
    const key = getStorageKey(type);
    if (key) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((item: any) => ({
            ...item,
            ...(type === 'friends' && { createdAt: new Date(item.createdAt) }),
            ...(type === 'splitexpenses' && { date: new Date(item.date) }),
            ...(type === 'transactions' && { timestamp: new Date(item.timestamp) })
          }));
        } catch (error) {
          console.error(`Error parsing stored ${type}:`, error);
          return [];
        }
      }
    }
    return [];
  };

  useEffect(() => {
    if (isLoaded && user?.id) {
      setFriends(loadFromStorage('friends'));
      setSplitExpenses(loadFromStorage('splitexpenses'));
      setTransactions(loadFromStorage('transactions'));
    }
  }, [isLoaded, user?.id]);

  const calculateMainBalance = () => transactions.reduce((total, t) => t.type === 'income' ? total + t.amount : total - t.amount, 0);
  const calculateTotalExpenses = () => transactions.filter(t => t.type === 'expense').reduce((total, t) => total + t.amount, 0);

  const calculateSplitBalances = () => {
    const balances: { [key: string]: number } = {};
    friends.forEach(friend => { balances[friend.name] = 0; });
    balances['You'] = 0;

    splitExpenses.forEach(expense => {
      const allPeople = new Set([expense.paidBy, ...expense.splitWith]);
      const totalPeople = allPeople.size;
      const perPerson = expense.amount / totalPeople;

      allPeople.forEach(person => {
        if (person !== expense.paidBy) {
          balances[person] -= perPerson;
          balances[expense.paidBy] += perPerson;
        }
      });
    });
    return balances;
  };

  const splitBalances = calculateSplitBalances();

  const addFriend = () => {
    if (!friendForm.name.trim() || !friendForm.email.trim()) return;
    const newFriend: Friend = { id: Date.now().toString(), name: friendForm.name.trim(), email: friendForm.email.trim(), createdAt: new Date() };
    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    saveToStorage('friends', updatedFriends);
    setFriendForm({ name: '', email: '' });
    setShowAddFriend(false);
  };

  const deleteFriend = (id: string) => {
    const friendToDelete = friends.find(f => f.id === id);
    if (!friendToDelete) return;
    const updatedFriends = friends.filter(f => f.id !== id);
    setFriends(updatedFriends);
    saveToStorage('friends', updatedFriends);
    const updatedExpenses = splitExpenses.map(expense => ({ ...expense, splitWith: expense.splitWith.filter(name => name !== friendToDelete.name) }));
    setSplitExpenses(updatedExpenses);
    saveToStorage('splitexpenses', updatedExpenses);
  };

  const addOrUpdateExpense = () => {
    if (!expenseForm.title.trim() || !expenseForm.amount || expenseForm.splitWith.length === 0) return;
    const amount = parseFloat(expenseForm.amount);
    const allPeople = new Set([expenseForm.paidBy, ...expenseForm.splitWith]);
    const totalPeople = allPeople.size;
    const perPersonAmount = amount / totalPeople;

    const expenseData = {
      title: expenseForm.title.trim(), amount, paidBy: expenseForm.paidBy,
      splitWith: expenseForm.splitWith, category: expenseForm.category,
      perPersonAmount, settled: false
    };

    let updatedExpenses;
    if (editingExpense) {
      updatedExpenses = splitExpenses.map(exp => exp.id === editingExpense.id ? { ...expenseData, id: editingExpense.id, date: editingExpense.date } : exp);
    } else {
      const newExpense: SplitExpense = { ...expenseData, id: Date.now().toString(), date: new Date() };
      updatedExpenses = [newExpense, ...splitExpenses];
    }

    setSplitExpenses(updatedExpenses);
    saveToStorage('splitexpenses', updatedExpenses);
    setExpenseForm({ title: '', amount: '', paidBy: 'You', splitWith: [], category: 'Food' });
    setEditingExpense(null);
    setShowAddExpense(false);
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = splitExpenses.filter(exp => exp.id !== id);
    setSplitExpenses(updatedExpenses);
    saveToStorage('splitexpenses', updatedExpenses);
  };

  const editExpense = (expense: SplitExpense) => {
    setExpenseForm({ title: expense.title, amount: expense.amount.toString(), paidBy: expense.paidBy, splitWith: expense.splitWith, category: expense.category });
    setEditingExpense(expense);
    setShowAddExpense(true);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(amount));

  const getFriendBalanceColor = (friendName: string, balance: number) => {
    if (balance === 0) return tTextSub;
    const userPaidForFriend = splitExpenses.some(expense => expense.paidBy === 'You' && expense.splitWith.includes(friendName));
    const friendPaidForUser = splitExpenses.some(expense => expense.paidBy === friendName && expense.splitWith.includes('You'));

    if (balance > 0) {
      return userPaidForFriend ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-rose-400' : 'text-rose-700');
    } else {
      return friendPaidForUser ? (isDark ? 'text-rose-400' : 'text-rose-700') : (isDark ? 'text-emerald-400' : 'text-emerald-700');
    }
  };

  // --- Dynamic Theme Classes ---
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

  return (
    <>
      <SignedIn>
        <div className={`min-h-screen transition-colors duration-500 ${tBg} ${tTextMain} ${tSelection} font-sans relative flex`}>
          
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
            "transition-all duration-300 ease-in-out flex-1 flex flex-col relative z-10",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            
            {/* Sticky Glassmorphic Topbar */}
            <header className={`sticky top-0 z-30 flex items-center justify-between h-20 px-8 md:px-12 backdrop-blur-md border-b transition-colors duration-500 ${isDark ? 'bg-[#020805]/80 border-white/[0.03]' : 'bg-[#F7F6F2]/80 border-black/[0.05]'}`}>
              <div className={`ml-4 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase transition-colors duration-500 ${isDark ? 'text-emerald-500/70' : 'text-emerald-800/70'}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDark ? 'bg-emerald-500' : 'bg-emerald-700'}`}></span>
                </span>
                Active Ledger Sync
              </div>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className="relative group w-6 h-6 flex items-center justify-center focus:outline-none"
                  aria-label="Toggle Theme"
                >
                  <div className={`w-2 h-2 transition-all duration-500 rounded-full ${isDark ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-transparent border-[1.5px] border-emerald-800 scale-[1.2]'}`} />
                  <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isDark ? 'bg-emerald-400/0 group-hover:bg-emerald-400/10' : 'bg-emerald-800/0 group-hover:bg-emerald-800/5'}`} />
                </button>

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

            {/* Natural Scrolling Main Content */}
            <main className="flex-1 p-6 md:p-8">
              <div className="max-w-6xl mx-auto space-y-10">
                
                {/* Header Section */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b transition-colors duration-500 ${tBorder}`}>
                  <div>
                    <p className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-4 transition-colors duration-500 ${isDark ? 'text-emerald-400/60' : 'text-emerald-800/60'}`}>
                      Distributed Asset Ledger
                    </p>
                    <h1 className={`${libreBaskerville.className} text-4xl md:text-5xl tracking-tighter mix-blend-normal`}>
                      SplitWise <span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Protocol.</span>
                    </h1>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`border p-6 flex flex-col justify-between transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Primary Ledger</span>
                      <IconReceipt className={`w-4 h-4 opacity-50 ${tTextMain}`} stroke={1.5} />
                    </div>
                    <span className={`${libreBaskerville.className} text-3xl md:text-4xl ${calculateMainBalance() >= 0 ? tTextMain : (isDark ? 'text-rose-400' : 'text-rose-700')}`}>
                      {formatCurrency(calculateMainBalance())}
                    </span>
                  </div>

                  <div className={`border p-6 flex flex-col justify-between transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Aggregate Deficit</span>
                      <IconChartBar className={`w-4 h-4 opacity-50 ${tTextMain}`} stroke={1.5} />
                    </div>
                    <span className={`${libreBaskerville.className} text-3xl md:text-4xl ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                      {formatCurrency(calculateTotalExpenses())}
                    </span>
                  </div>

                  <div className={`border p-6 flex flex-col justify-between transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Shared Net</span>
                      <IconUsers className={`w-4 h-4 opacity-50 ${tTextMain}`} stroke={1.5} />
                    </div>
                    <span className={`${libreBaskerville.className} text-3xl md:text-4xl ${splitBalances['You'] > 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : splitBalances['You'] < 0 ? (isDark ? 'text-rose-400' : 'text-rose-700') : tTextMain}`}>
                      {splitBalances['You'] > 0 ? '+' : ''}{formatCurrency(splitBalances['You'] || 0)}
                    </span>
                  </div>
                </div>

                {/* Split Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Split Expenses List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className={`border transition-colors duration-500 ${tBorder} ${isDark ? 'bg-[#020805]/50' : 'bg-white/40'}`}>
                      <div className={`p-6 border-b flex items-center justify-between ${tBorder}`}>
                        <h2 className={`text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 ${tTextSub}`}>
                          <div className="w-1.5 h-1.5 bg-current opacity-50" /> Shared Ledger
                        </h2>
                        <button
                          onClick={() => setShowAddExpense(true)}
                          className={`h-8 px-4 border text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30' : 'border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/10'}`}
                        >
                          <IconPlus className="w-3 h-3" stroke={1.5} /> ADD EXPENSE
                        </button>
                      </div>
                      
                      <div className={`divide-y transition-colors duration-500 ${isDark ? 'divide-white/[0.02]' : 'divide-black/[0.04]'}`}>
                        {splitExpenses.length === 0 ? (
                          <div className={`p-12 text-center font-mono text-xs uppercase tracking-widest ${tTextSub}`}>
                            <p>No shared expenses recorded.</p>
                          </div>
                        ) : (
                          splitExpenses.map((expense) => (
                            <div key={expense.id} className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'}`}>
                              <div>
                                <p className={`font-mono text-sm tracking-wide mb-1 ${tTextMain}`}>{expense.title}</p>
                                <p className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>
                                  INITIATOR: {expense.paidBy} <span className="mx-2 opacity-50">•</span> SPLIT: {expense.splitWith.join(', ')}
                                </p>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className={`font-mono text-sm tracking-tight ${tTextMain}`}>{formatCurrency(expense.amount)}</p>
                                  <p className={`text-[10px] font-mono uppercase tracking-widest opacity-60 ${tTextSub}`}>{formatCurrency(expense.perPersonAmount)} / person</p>
                                </div>
                                <div className="flex items-center gap-3 border-l pl-4 border-current opacity-50">
                                  <button onClick={() => editExpense(expense)} className={`transition-colors ${isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-700'}`}>
                                    <IconEdit className="w-4 h-4" stroke={1.5} />
                                  </button>
                                  <button onClick={() => deleteExpense(expense.id)} className={`transition-colors ${isDark ? 'hover:text-rose-400' : 'hover:text-rose-700'}`}>
                                    <IconTrash className="w-4 h-4" stroke={1.5} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Friends List */}
                  <div className="space-y-6">
                    <div className={`border transition-colors duration-500 ${tBorder} ${isDark ? 'bg-[#020805]/50' : 'bg-white/40'}`}>
                      <div className={`p-6 border-b flex items-center justify-between ${tBorder}`}>
                        <h2 className={`text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 ${tTextSub}`}>
                          <div className="w-1.5 h-1.5 bg-current opacity-50" /> Contacts Network
                        </h2>
                        <button
                          onClick={() => setShowAddFriend(true)}
                          className={`h-8 px-3 border text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-1 ${isDark ? 'border-white/[0.1] text-neutral-400 hover:bg-white/[0.05]' : 'border-black/[0.1] text-neutral-600 hover:bg-black/[0.05]'}`}
                        >
                          <IconPlus className="w-3 h-3" stroke={1.5} /> ADD
                        </button>
                      </div>
                      
                      <div className={`divide-y transition-colors duration-500 ${isDark ? 'divide-white/[0.02]' : 'divide-black/[0.04]'}`}>
                        {friends.length === 0 ? (
                          <div className={`p-8 text-center font-mono text-[10px] uppercase tracking-widest ${tTextSub}`}>
                            <p>Network empty.</p>
                          </div>
                        ) : (
                          friends.map((friend) => (
                            <div key={friend.id} className={`p-4 flex items-center justify-between transition-colors duration-300 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'}`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 shrink-0 border flex items-center justify-center text-[10px] font-mono uppercase ${isDark ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' : 'border-emerald-800/30 text-emerald-800 bg-emerald-800/10'}`}>
                                  {friend.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className={`font-mono text-xs tracking-wide ${tTextMain}`}>{friend.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`text-[11px] font-mono tracking-wider ${getFriendBalanceColor(friend.name, splitBalances[friend.name] || 0)}`}>
                                  {splitBalances[friend.name] > 0 && '+'}{formatCurrency(splitBalances[friend.name] || 0)}
                                </span>
                                <button onClick={() => deleteFriend(friend.id)} className={`opacity-50 hover:opacity-100 transition-opacity ${isDark ? 'hover:text-rose-400' : 'hover:text-rose-700'}`}>
                                  <IconTrash className="w-3.5 h-3.5" stroke={1.5} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </main>
          </div>
        </div>

        {/* --- MODALS OVERLAY --- */}
        <AnimatePresence>
          {/* Add Friend Modal */}
          {showAddFriend && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans ${isDark ? 'bg-[#020805]/90' : 'bg-[#F7F6F2]/90'}`}>
              <div className={`border shadow-2xl p-8 w-full max-w-md ${isDark ? 'bg-[#020805] border-emerald-500/20' : 'bg-[#F7F6F2] border-emerald-800/20'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-3 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                    <IconUser className="w-4 h-4" stroke={1.2} /> Register Contact
                  </h3>
                  <button onClick={() => { setShowAddFriend(false); setFriendForm({ name: '', email: '' }); }} className={`transition-colors ${tTextSub} hover:${isDark ? 'text-white' : 'text-black'}`}>
                    <IconX className="w-4 h-4" stroke={1.5} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Identifier (Name)</label>
                    <input
                      type="text"
                      value={friendForm.name}
                      onChange={(e) => setFriendForm({...friendForm, name: e.target.value})}
                      className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50 placeholder:text-neutral-700' : 'border-black/[0.15] text-black focus:border-emerald-800/50 placeholder:text-neutral-400'}`}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Comm Link (Email)</label>
                    <input
                      type="email"
                      value={friendForm.email}
                      onChange={(e) => setFriendForm({...friendForm, email: e.target.value})}
                      className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50 placeholder:text-neutral-700' : 'border-black/[0.15] text-black focus:border-emerald-800/50 placeholder:text-neutral-400'}`}
                      placeholder="e.g. comms@network.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  <button onClick={addFriend} className={`w-full h-12 font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${isDark ? 'bg-emerald-500 text-[#020805] hover:bg-emerald-400' : 'bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700'}`}>
                    EXECUTE REGISTRATION
                  </button>
                  <button onClick={() => { setShowAddFriend(false); setFriendForm({ name: '', email: '' }); }} className={`w-full h-12 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-white/[0.05] text-neutral-400 hover:text-white' : 'border-black/[0.08] text-neutral-600 hover:text-black'}`}>
                    ABORT
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add/Edit Expense Modal */}
          {showAddExpense && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans ${isDark ? 'bg-[#020805]/90' : 'bg-[#F7F6F2]/90'}`}>
              <div className={`border shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar ${isDark ? 'bg-[#020805] border-emerald-500/20' : 'bg-[#F7F6F2] border-emerald-800/20'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-3 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                    <IconReceipt className="w-4 h-4" stroke={1.2} /> {editingExpense ? 'Modify Shared Entry' : 'New Shared Entry'}
                  </h3>
                  <button onClick={() => { setShowAddExpense(false); setEditingExpense(null); setExpenseForm({ title: '', amount: '', paidBy: 'You', splitWith: [], category: 'Food' }); }} className={`transition-colors ${tTextSub} hover:${isDark ? 'text-white' : 'text-black'}`}>
                    <IconX className="w-4 h-4" stroke={1.5} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Descriptor Tag</label>
                    <input
                      type="text"
                      value={expenseForm.title}
                      onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                      className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50 placeholder:text-neutral-700' : 'border-black/[0.15] text-black focus:border-emerald-800/50 placeholder:text-neutral-400'}`}
                      placeholder="e.g. Dinner Protocol"
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Value (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50 placeholder:text-neutral-700' : 'border-black/[0.15] text-black focus:border-emerald-800/50 placeholder:text-neutral-400'}`}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Initiator (Paid By)</label>
                    <select
                      value={expenseForm.paidBy}
                      onChange={(e) => setExpenseForm({...expenseForm, paidBy: e.target.value})}
                      className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors appearance-none ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50' : 'border-black/[0.15] text-black focus:border-emerald-800/50'}`}
                    >
                      <option value="You" className={isDark ? "bg-[#020805]" : "bg-white"}>You (Local)</option>
                      {friends.map(f => <option key={f.id} value={f.name} className={isDark ? "bg-[#020805]" : "bg-white"}>{f.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Distribution Nodes (Split With)</label>
                    {friends.length === 0 ? (
                      <p className={`text-[10px] font-mono p-4 border ${isDark ? 'border-white/[0.05] bg-white/[0.02] text-neutral-500' : 'border-black/[0.05] bg-black/[0.02] text-neutral-500'}`}>
                        Network empty. Register contacts first.
                      </p>
                    ) : (
                      <div className={`space-y-3 p-4 border max-h-40 overflow-y-auto no-scrollbar ${isDark ? 'border-white/[0.1] bg-white/[0.01]' : 'border-black/[0.15] bg-black/[0.01]'}`}>
                        <label className={`flex items-center gap-3 cursor-pointer text-[11px] font-mono uppercase tracking-widest ${tTextMain}`}>
                          <input
                            type="checkbox"
                            checked={expenseForm.splitWith.includes('You')}
                            onChange={(e) => {
                              const newSplit = e.target.checked ? [...expenseForm.splitWith, 'You'] : expenseForm.splitWith.filter(p => p !== 'You');
                              setExpenseForm({...expenseForm, splitWith: newSplit});
                            }}
                            className="w-3.5 h-3.5 accent-emerald-500 rounded-none bg-transparent"
                          />
                          You (Local)
                        </label>
                        {friends.map(friend => (
                          <label key={friend.id} className={`flex items-center gap-3 cursor-pointer text-[11px] font-mono uppercase tracking-widest ${tTextMain}`}>
                            <input
                              type="checkbox"
                              checked={expenseForm.splitWith.includes(friend.name)}
                              onChange={(e) => {
                                const newSplit = e.target.checked ? [...expenseForm.splitWith, friend.name] : expenseForm.splitWith.filter(p => p !== friend.name);
                                setExpenseForm({...expenseForm, splitWith: newSplit});
                              }}
                              className="w-3.5 h-3.5 accent-emerald-500 rounded-none bg-transparent"
                            />
                            {friend.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Class (Category)</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                      className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors appearance-none ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50' : 'border-black/[0.15] text-black focus:border-emerald-800/50'}`}
                    >
                      {['Food', 'Entertainment', 'Travel', 'Shopping', 'Bills', 'Other'].map(cat => (
                        <option key={cat} value={cat} className={isDark ? "bg-[#020805]" : "bg-white"}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  <button
                    onClick={addOrUpdateExpense}
                    disabled={friends.length === 0 || expenseForm.splitWith.length === 0}
                    className={`w-full h-12 font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-emerald-500 text-[#020805] hover:bg-emerald-400' : 'bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700'}`}
                  >
                    {editingExpense ? 'COMMIT MODIFICATION' : 'EXECUTE ENTRY'}
                  </button>
                  <button
                    onClick={() => { setShowAddExpense(false); setEditingExpense(null); setExpenseForm({ title: '', amount: '', paidBy: 'You', splitWith: [], category: 'Food' }); }}
                    className={`w-full h-12 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-white/[0.05] text-neutral-400 hover:text-white' : 'border-black/[0.08] text-neutral-600 hover:text-black'}`}
                  >
                    ABORT
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