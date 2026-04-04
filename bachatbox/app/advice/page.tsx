"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
import {
  IconActivity,
  IconSparkles,
  IconRefresh,
  IconLoader,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconShield,
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

type AdviceData = {
  healthScore: number;
  healthStatus: string;
  topSpending: string;
  savingsOpportunity: string;
  monthlyTrend: string;
  budgetStatus: string;
  recommendations: string[];
  insights: string[];
  goals: string[];
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

// --- Redesigned Luxury AI Cards ---
const LuxuryAdviceCard = ({ title, content, icon, className, delay = 0, isDark, tBorder, tTextSub, tTextMain }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={cn(
        `flex flex-col border p-6 transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01] hover:bg-white/[0.02]' : 'bg-black/[0.01] hover:bg-black/[0.02]'}`,
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={isDark ? "text-emerald-400" : "text-emerald-800"}>
          {icon}
        </div>
        <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] ${tTextMain}`}>{title}</h3>
      </div>
      <p className={`text-xs leading-relaxed flex-1 overflow-y-auto no-scrollbar font-mono tracking-wide ${tTextSub}`}>
        {content}
      </p>
    </motion.div>
  );
};

const LuxuryScoreCard = ({ score, status, delay = 0, className, isDark, tBorder, tTextSub, tTextMain }: any) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return isDark ? 'text-emerald-400' : 'text-emerald-700';
    if (s >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-700';
    return isDark ? 'text-rose-400' : 'text-rose-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay }}
      className={cn(
        `flex flex-col justify-center items-center h-full border p-8 transition-colors duration-500 relative overflow-hidden ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`,
        className
      )}
    >
      <div className="mb-6 text-center relative z-10">
        <div className={cn("text-7xl md:text-8xl tracking-tighter mb-4", libreBaskerville.className, getScoreColor(score))}>
          {score}
        </div>
        <div className={`text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 ${tTextSub}`}>
          Capital Assessment Score
        </div>
      </div>
      <div className={`text-sm font-mono uppercase tracking-widest px-4 py-2 border relative z-10 ${isDark ? 'border-white/[0.1] text-neutral-300' : 'border-black/[0.1] text-neutral-700'}`}>
        {status}
      </div>
      
      {/* Decorative large background text */}
      <div className={`absolute -right-4 -bottom-10 text-[180px] font-bold opacity-[0.02] pointer-events-none select-none ${libreBaskerville.className} ${tTextMain}`}>
        {score}
      </div>
    </motion.div>
  );
};

export default function AdvicePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Logic State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<string>('');
  const [adviceData, setAdviceData] = useState<AdviceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [layoutVariant, setLayoutVariant] = useState(0);

  // Local Storage Functions
  const getStorageKey = () => user?.id ? `bachatbox_${user.id}_transactions` : null;
  const getBudgetKey = () => user?.id ? `bachatbox_${user.id}_budget` : null;

  useEffect(() => {
    if (isLoaded && user?.id) {
      const storedTransactions = localStorage.getItem(getStorageKey() || '');
      if (storedTransactions) {
        try {
          setTransactions(JSON.parse(storedTransactions).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })));
        } catch (e) { console.error(e); }
      }
      setBudget(localStorage.getItem(getBudgetKey() || '') || '');
    }
  }, [isLoaded, user?.id]);

  const generateAdvice = async () => {
    if (transactions.length === 0) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, budget, userId: user?.id })
      });
      const data = await response.json();
      if (response.ok) {
        setAdviceData(data.advice);
        setLayoutVariant(Math.floor(Math.random() * 3));
      }
    } catch (error) {
      console.error('Error generating advice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

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

  // --- Dynamic Layouts (Strict Flex/Grid constraints for non-scrolling) ---
  const renderAdviceDashboard = () => {
    if (!adviceData) return null;

    const layoutProps = { isDark, tBorder, tTextSub, tTextMain };

    const layouts = [
      // Layout 1: Prominent Grid
      <div key="layout1" className="grid grid-cols-12 grid-rows-6 gap-6 h-full min-h-0">
        <div className="col-span-12 md:col-span-4 row-span-4 flex flex-col min-h-0">
          <LuxuryScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} {...layoutProps} />
        </div>
        <div className="col-span-12 md:col-span-8 row-span-4 grid grid-cols-2 gap-6 min-h-0">
          <LuxuryAdviceCard title="Top Spending" content={adviceData.topSpending} icon={<IconTrendingDown className="w-4 h-4" stroke={1.2} />} delay={0.4} {...layoutProps} />
          <LuxuryAdviceCard title="Savings Opportunity" content={adviceData.savingsOpportunity} icon={<IconTarget className="w-4 h-4" stroke={1.2} />} delay={0.6} {...layoutProps} />
          <LuxuryAdviceCard title="Monthly Trend" content={adviceData.monthlyTrend} icon={<IconTrendingUp className="w-4 h-4" stroke={1.2} />} delay={0.8} className="col-span-2" {...layoutProps} />
        </div>
        <div className="col-span-12 row-span-2 grid grid-cols-3 gap-6 min-h-0">
          {adviceData.recommendations.slice(0, 3).map((rec, idx) => (
            <LuxuryAdviceCard key={idx} title={`Action ${idx + 1}`} content={rec} icon={<IconSparkles className="w-4 h-4" stroke={1.2} />} delay={1 + idx * 0.2} {...layoutProps} />
          ))}
        </div>
      </div>,

      // Layout 2: Vertical flow Focus
      <div key="layout2" className="flex flex-col md:flex-row gap-6 h-full min-h-0">
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          <div className="flex-1 min-h-0">
            <LuxuryScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} {...layoutProps} />
          </div>
          <div className="flex-1 min-h-0">
            <LuxuryAdviceCard title="Budget Analysis" content={adviceData.budgetStatus} icon={<IconShield className="w-4 h-4" stroke={1.2} />} delay={0.4} className="h-full" {...layoutProps} />
          </div>
        </div>
        <div className="flex-[2] grid grid-rows-4 gap-6 min-h-0">
          <LuxuryAdviceCard title="Primary Insight" content={adviceData.insights[0] || "Track your spending patterns"} icon={<IconActivity className="w-4 h-4" stroke={1.2} />} delay={0.6} className="row-span-1" {...layoutProps} />
          {adviceData.goals.slice(0, 3).map((goal, idx) => (
            <LuxuryAdviceCard key={idx} title={`Objective ${idx + 1}`} content={goal} icon={<IconTarget className="w-4 h-4" stroke={1.2} />} delay={0.8 + idx * 0.2} className="row-span-1" {...layoutProps} />
          ))}
        </div>
      </div>,

      // Layout 3: Masonry Assymetric
      <div key="layout3" className="grid grid-cols-4 grid-rows-4 gap-6 h-full min-h-0">
        <div className="col-span-4 md:col-span-2 row-span-3 min-h-0 flex flex-col">
          <LuxuryScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} {...layoutProps} />
        </div>
        <div className="col-span-4 md:col-span-2 row-span-2 grid grid-rows-2 gap-6 min-h-0">
          <LuxuryAdviceCard title="Data Insight" content={adviceData.insights[0] || "Patterns analyzed"} icon={<IconActivity className="w-4 h-4" stroke={1.2} />} delay={0.4} {...layoutProps} />
          <LuxuryAdviceCard title="Capital Optimization" content={adviceData.savingsOpportunity} icon={<IconTarget className="w-4 h-4" stroke={1.2} />} delay={0.6} {...layoutProps} />
        </div>
        <div className="col-span-4 md:col-span-2 row-span-1 min-h-0">
          <LuxuryAdviceCard title="Threshold Status" content={adviceData.budgetStatus} icon={<IconShield className="w-4 h-4" stroke={1.2} />} delay={0.7} className="h-full" {...layoutProps} />
        </div>
        <div className="col-span-4 row-span-1 grid grid-cols-3 gap-6 min-h-0">
          {adviceData.recommendations.slice(0, 3).map((rec, idx) => (
            <LuxuryAdviceCard key={idx} title={`Protocol ${idx + 1}`} content={rec} icon={<IconSparkles className="w-4 h-4" stroke={1.2} />} delay={0.8 + idx * 0.2} {...layoutProps} />
          ))}
        </div>
      </div>
    ];

    return layouts[layoutVariant];
  };

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
                AI Dashboard Analysis
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
              <div className="w-full max-w-[1400px] mx-auto flex flex-col h-full">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    // LOADING STATE
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex-1 flex items-center justify-center border transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                      <div className="text-center flex flex-col items-center">
                        <IconLoader className={`w-8 h-8 animate-spin mb-6 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`} stroke={1.2} />
                        <h2 className={`text-xs font-mono uppercase tracking-[0.2em] mb-2 ${tTextMain}`}>Analyzing Ledger Data</h2>
                        <p className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Synthesizing financial intelligence...</p>
                      </div>
                    </motion.div>
                  ) : adviceData ? (
                    // GENERATED DASHBOARD STATE
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col h-full min-h-0">
                      <div className="ml-6 mb-6 flex justify-between items-end flex-shrink-0">
                        <div>
                          <p className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-2 transition-colors duration-500 ${isDark ? 'text-emerald-400/60' : 'text-emerald-800/60'}`}>
                            Automated Intelligence
                          </p>
                          <h1 className={`${libreBaskerville.className} text-3xl md:text-4xl tracking-tighter mix-blend-normal`}>
                            Strategic <span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Insights.</span>
                          </h1>
                        </div>
                        <button
                          onClick={generateAdvice}
                          className={`flex items-center gap-2 h-10 px-6 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30' : 'border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/10'}`}
                        >
                          <IconRefresh className="w-3.5 h-3.5" stroke={1.2} /> RECALCULATE
                        </button>
                      </div>
                      
                      <div className="flex-1 min-h-0 pb-2 ml-6">
                        {renderAdviceDashboard()}
                      </div>
                    </motion.div>
                  ) : (
                    // INITIAL STATE (Pre-Generation)
                    <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
                      {transactions.length > 0 ? (
                        <div className={`w-full max-w-3xl border p-12 transition-colors duration-500 text-center ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                          <div className={`mb-6 flex justify-center ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                            <IconActivity className="w-12 h-12" stroke={1.2} />
                          </div>
                          <h1 className={`${libreBaskerville.className} text-3xl md:text-4xl tracking-tighter mb-4`}>
                            Automated Financial <span className={`italic ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Intelligence.</span>
                          </h1>
                          <p className={`text-[11px] font-mono uppercase tracking-widest mb-10 mx-auto max-w-lg leading-relaxed ${tTextSub}`}>
                            Initiate the intelligence protocol to analyze current ledger data and formulate strategic recommendations.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div className={`border p-4 transition-colors ${tBorder} ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
                              <div className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Aggregate Capital</div>
                              <div className={`text-lg font-mono ${tTextMain}`}>{formatCurrency(totalIncome)}</div>
                            </div>
                            <div className={`border p-4 transition-colors ${tBorder} ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
                              <div className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Aggregate Deficit</div>
                              <div className={`text-lg font-mono ${tTextMain}`}>{formatCurrency(totalExpenses)}</div>
                            </div>
                            <div className={`border p-4 transition-colors ${tBorder} ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
                              <div className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Net Assessment</div>
                              <div className={`text-lg font-mono ${balance >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-rose-400' : 'text-rose-700')}`}>
                                {formatCurrency(balance)}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={generateAdvice}
                            className={`h-12 px-10 border text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all ${isDark ? 'bg-emerald-500 text-[#020805] hover:bg-emerald-400 border-emerald-400' : 'bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700 border-emerald-900'}`}
                          >
                            GENERATE INTELLIGENCE REPORT
                          </button>
                        </div>
                      ) : (
                        <div className={`w-full max-w-2xl border p-12 text-center transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                          <IconChartBar className={`w-12 h-12 mx-auto mb-6 ${tTextSub}`} stroke={1.2} />
                          <h3 className={`text-xs font-mono uppercase tracking-[0.2em] mb-4 ${tTextMain}`}>No Ledger Data Detected</h3>
                          <p className={`text-[10px] font-mono uppercase tracking-widest mb-8 max-w-md mx-auto leading-relaxed ${tTextSub}`}>
                            The system requires initial capital and deficit records to establish a baseline for analysis.
                          </p>
                          <button
                            onClick={() => router.push('/apppage')}
                            className={`h-10 px-8 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30' : 'border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/10'}`}
                          >
                            POPULATE LEDGER
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
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