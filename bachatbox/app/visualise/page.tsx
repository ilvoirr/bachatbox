"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
import { motion } from "framer-motion";
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

// --- Redesigned Minimalist Charts ---
const PieChart = ({ data, title, isDark, tBorder, tTextSub, tTextMain }: any) => {
  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const colors = isDark 
    ? ['rgba(52, 211, 153, 0.9)', 'rgba(52, 211, 153, 0.5)', 'rgba(52, 211, 153, 0.2)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
    : ['rgba(6, 95, 70, 0.9)', 'rgba(6, 95, 70, 0.5)', 'rgba(6, 95, 70, 0.2)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.05)'];

  return (
    <div className={`h-full flex flex-col border p-6 transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
      <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${tTextSub}`}>
        <div className="w-1.5 h-1.5 bg-current opacity-50" /> {title}
      </h3>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="relative w-full max-w-[160px] aspect-square flex items-center justify-center">
          <svg viewBox="0 0 256 256" className="w-full h-full transform -rotate-90">
            <circle cx="128" cy="128" r="100" fill="none" stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} strokeWidth="12" />
            {data.map((item: any, index: number) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 6.28} 628`;
              const strokeDashoffset = -cumulativePercentage * 6.28;
              cumulativePercentage += percentage;
              return (
                <circle key={index} cx="128" cy="128" r="100" fill="none" stroke={colors[index % colors.length]} strokeWidth="12" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000" />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className={`text-xl md:text-2xl ${libreBaskerville.className} ${tTextMain}`}>
              {total >= 1000 ? `₹${(total/1000).toFixed(1)}k` : `₹${total}`}
            </div>
            <div className={`text-[8px] font-mono uppercase tracking-widest ${tTextSub}`}>Total</div>
          </div>
        </div>

        <div className="w-full mt-6 space-y-3 overflow-y-auto pr-2 no-scrollbar">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-none shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className={`truncate ${tTextSub}`}>{item.name}</span>
              </div>
              <span className={`shrink-0 ml-2 ${tTextMain}`}>₹{item.value.toLocaleString()} <span className="opacity-40">({((item.value / total) * 100).toFixed(0)}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CombinedBarChart = ({ incomeExpenseData, topExpenses, title, isDark, tBorder, tTextSub, tTextMain }: any) => {
  const allData = [...incomeExpenseData, ...topExpenses];
  const maxValue = Math.max(...allData.map((item: any) => item.value), 1); 

  const getBarColor = (name: string, isTopExpense: boolean = false) => {
    if (name.toLowerCase().includes('income')) return isDark ? 'bg-emerald-400' : 'bg-emerald-800';
    if (isTopExpense) return isDark ? 'bg-white/20' : 'bg-black/20';
    return isDark ? 'bg-white/60' : 'bg-black/60';
  };

  return (
    <div className={`h-full flex flex-col border p-6 transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
      <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${tTextSub}`}>
        <div className="w-1.5 h-1.5 bg-current opacity-50" /> {title}
      </h3>
      <div className="flex-1 flex flex-col justify-center space-y-6 min-h-0 overflow-y-auto no-scrollbar pr-2">
        
        {/* Income vs Expenses */}
        <div className="space-y-4">
          {incomeExpenseData.map((item: any, index: number) => (
            <div key={`main-${index}`} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                <span className={tTextSub}>{item.name}</span>
                <span className={tTextMain}>₹{item.value.toLocaleString()}</span>
              </div>
              <div className={`w-full h-1 ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.05]'}`}>
                <div className={`h-full transition-all duration-1000 ${getBarColor(item.name)}`} style={{ width: `${(item.value / maxValue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {topExpenses.length > 0 && (
          <div className="pt-4 space-y-4">
            <h4 className={`text-[9px] font-mono uppercase tracking-[0.2em] opacity-50 ${tTextSub}`}>Top Expense Vectors</h4>
            {topExpenses.map((item: any, index: number) => (
              <div key={`expense-${index}`} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                  <span className={tTextSub}>{item.name}</span>
                  <span className={tTextMain}>₹{item.value.toLocaleString()}</span>
                </div>
                <div className={`w-full h-1 ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.05]'}`}>
                  <div className={`h-full transition-all duration-1000 ${getBarColor(item.name, true)}`} style={{ width: `${(item.value / maxValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function VisualisePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Logic State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<string>('');

  const getStorageKey = () => user?.id ? `bachatbox_${user.id}_transactions` : null;
  const getBudgetKey = () => user?.id ? `bachatbox_${user.id}_budget` : null;

  useEffect(() => {
    if (isLoaded && user?.id) {
      const tKey = getStorageKey();
      if (tKey) {
        const stored = localStorage.getItem(tKey);
        if (stored) {
          try {
            setTransactions(JSON.parse(stored).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })));
          } catch (e) { console.error(e); }
        }
      }
      const bKey = getBudgetKey();
      if (bKey) setBudget(localStorage.getItem(bKey) || '');
    }
  }, [isLoaded, user?.id]);

  const saveBudget = () => {
    const key = getBudgetKey();
    if (key && budget.trim()) localStorage.setItem(key, budget.trim());
  };

  const calculateStats = () => {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const expenseByCategory = expenses.reduce((acc, t) => {
      const category = t.category || t.description || 'Other';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topExpenses = Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      expenseByCategory: Object.entries(expenseByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      topExpenses,
    };
  };

  const stats = calculateStats();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

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
        {/* Full Desktop Lock */}
        <div className={`min-h-screen md:h-screen md:overflow-hidden transition-colors duration-500 ${tBg} ${tTextMain} ${tSelection} font-sans relative flex`}>
          
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
            <header className={`shrink-0 flex items-center justify-between h-20 px-8 md:px-12 backdrop-blur-md border-b transition-colors duration-500 ${isDark ? 'bg-[#020805]/80 border-white/[0.03]' : 'bg-[#F7F6F2]/80 border-black/[0.05]'}`}>
              <div className={`ml-4 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase transition-colors duration-500 ${isDark ? 'text-emerald-500/70' : 'text-emerald-800/70'}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDark ? 'bg-emerald-500' : 'bg-emerald-700'}`}></span>
                </span>
                Data Visualisation
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

            {/* Dashboard Content - Strict Flex Layout to prevent scrolling on desktop */}
            <main className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto md:overflow-hidden min-h-0">
              <div className="w-full max-w-6xl mx-auto flex flex-col h-full gap-6">
                
                {transactions.length === 0 ? (
                  <div className={`flex-1 flex flex-col items-center justify-center border transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                    <SysChart c={`w-12 h-12 mb-6 ${tTextSub}`} />
                    <h2 className={`text-xs font-mono uppercase tracking-[0.2em] mb-2 ${tTextMain}`}>Insufficient Data Sets</h2>
                    <p className={`text-[10px] font-mono uppercase tracking-widest mb-8 ${tTextSub}`}>Execute transactions in the ledger to populate analytics.</p>
                    <button
                      onClick={() => router.push('/apppage')}
                      className={`h-10 px-8 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30' : 'border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/10'}`}
                    >
                      RETURN TO LEDGER
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                      <div className={`border p-6 flex flex-col justify-between transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                        <span className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${tTextSub}`}>Aggregate Capital</span>
                        <span className={`${libreBaskerville.className} text-3xl md:text-4xl ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                          {formatCurrency(stats.totalIncome)}
                        </span>
                      </div>
                      
                      <div className={`border p-6 flex flex-col justify-between transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                        <span className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${tTextSub}`}>Aggregate Deficit</span>
                        <span className={`${libreBaskerville.className} text-3xl md:text-4xl ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                          {formatCurrency(stats.totalExpenses)}
                        </span>
                      </div>
                      
                      <div className={`border p-6 flex flex-col justify-between transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                        <span className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${tTextSub}`}>Net Assessment</span>
                        <span className={`${libreBaskerville.className} text-3xl md:text-4xl ${stats.balance >= 0 ? tTextMain : (isDark ? 'text-rose-500' : 'text-rose-600')}`}>
                          {formatCurrency(stats.balance)}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Budget Input */}
                    <div className="shrink-0 flex items-center justify-center w-full">
                      <div className={`flex w-full max-w-2xl border transition-colors duration-500 h-12 ${tBorder} ${isDark ? 'bg-[#020805]' : 'bg-white'}`}>
                        <input
                          type="number"
                          step="1000"
                          placeholder="ESTABLISH MONTHLY THRESHOLD (INR)"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className={`flex-1 bg-transparent px-6 font-mono text-[10px] md:text-xs uppercase tracking-widest focus:outline-none transition-colors ${isDark ? 'text-white placeholder:text-neutral-700' : 'text-black placeholder:text-neutral-400'}`}
                        />
                        <button
                          onClick={saveBudget}
                          className={`px-8 h-full border-l text-[10px] font-mono uppercase tracking-[0.15em] font-bold transition-colors ${tBorder} ${isDark ? 'bg-white text-[#020805] hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
                        >
                          SET THRESHOLD
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Charts (Takes up remaining space) */}
                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-[400px] lg:h-full">
                        {stats.expenseByCategory.length > 0 ? (
                          <PieChart 
                            data={stats.expenseByCategory} 
                            title="Deficit Distribution" 
                            isDark={isDark} tBorder={tBorder} tTextSub={tTextSub} tTextMain={tTextMain}
                          />
                        ) : (
                          <div className={`h-full border flex items-center justify-center ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                            <span className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>NO DEFICIT DATA</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="h-[400px] lg:h-full">
                        <CombinedBarChart
                          incomeExpenseData={[
                            { name: 'Capital (Income)', value: stats.totalIncome },
                            { name: 'Deficit (Expense)', value: stats.totalExpenses }
                          ]}
                          topExpenses={stats.topExpenses}
                          title="Capital vs Deficit Vectors"
                          isDark={isDark} tBorder={tBorder} tTextSub={tTextSub} tTextMain={tTextMain}
                        />
                      </div>
                    </div>
                  </>
                )}
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