"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
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
  IconReceipt,
  IconPlus,
  IconMinus,
  IconTrash,
  IconUsers,
  IconTable,
  IconCamera,
  IconUpload,
  IconRefresh,
  IconSparkles,
  IconTrendingUp,
  IconTrendingDown,
  IconCoin,
  IconPigMoney,
  IconWallet,
  IconCreditCard,
  IconShoppingCart,
  IconHome,
  IconCar,
  IconPlane,
  IconCoffee,
  IconAlertTriangle,
  IconTarget,
  IconAward,
  IconUser,
  IconBook,
  IconShieldCheck,
  IconActivity
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
interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  description: string;
  date?: string;
  timestamp: Date;
}

interface Scenario {
  title: string;
  description: string;
  probability: number;
  icon: string;
  color: string;
}

interface Personality {
  type: string;
  badge: string;
  description: string;
}

interface Achievement {
  title: string;
  icon: string;
  unlocked: boolean;
}

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

// Helper function to get appropriate icon for scenario
const getScenarioIcon = (iconString: string, isDark: boolean) => {
  const c = `w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`;
  const s = 1.2;
  const iconMap: { [key: string]: React.ReactNode } = {
    'money': <IconCoin className={c} stroke={s} />,
    'savings': <IconPigMoney className={c} stroke={s} />,
    'wallet': <IconWallet className={c} stroke={s} />,
    'card': <IconCreditCard className={c} stroke={s} />,
    'trending-up': <IconTrendingUp className={c} stroke={s} />,
    'trending-down': <IconTrendingDown className={c} stroke={s} />,
    'shopping': <IconShoppingCart className={c} stroke={s} />,
    'home': <IconHome className={c} stroke={s} />,
    'car': <IconCar className={c} stroke={s} />,
    'plane': <IconPlane className={c} stroke={s} />,
    'coffee': <IconCoffee className={c} stroke={s} />,
    'alert': <IconAlertTriangle className={c} stroke={s} />,
    'target': <IconTarget className={c} stroke={s} />,
    'chart': <IconChartBar className={c} stroke={s} />,
    'default': <IconSparkles className={c} stroke={s} />
  };
  return iconMap[iconString] || iconMap['default'];
};

// Helper function to get personality icon
const getPersonalityIcon = (type: string, isDark: boolean) => {
  const c = `w-12 h-12 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`;
  const s = 1;
  const iconMap: { [key: string]: React.ReactNode } = {
    'saver': <IconPigMoney className={c} stroke={s} />,
    'spender': <IconShoppingCart className={c} stroke={s} />,
    'investor': <IconTrendingUp className={c} stroke={s} />,
    'balanced': <IconTarget className={c} stroke={s} />,
    'default': <IconUser className={c} stroke={s} />
  };
  return iconMap[type.toLowerCase()] || iconMap['default'];
};

export default function SimulatorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -------------------- Simulator State --------------------
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getStorageKey = () => user?.id ? `bachatbox_${user.id}_transactions` : null;

  // -------------------- Simulator Logic --------------------
  const runSimulation = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const key = getStorageKey();
      if (!key) { alert('User ID not available'); setLoading(false); return; }

      const transactionsData = localStorage.getItem(key);
      let transactions: Transaction[] = [];
      
      if (transactionsData) {
        try {
          transactions = JSON.parse(transactionsData).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) }));
        } catch (error) { console.error('Error parsing transactions:', error); }
      }
      
      if (transactions.length === 0) {
        alert('No transaction data found! Add some expenses first in your Balance Sheet.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
      });
      
      if (!response.ok) throw new Error('Simulation API failed');
      
      const result = await response.json();
      setScenarios(result.scenarios || []);
      setPersonality(result.personality || null);
      setAchievements(result.achievements || []);
      setShowDetails(true);
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed! Make sure you have transaction data first.');
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      <SignedIn>
        {/* Outer Wrapper: min-h-screen allows natural browser scrolling */}
        <div className={`min-h-screen transition-colors duration-500 ${tBg} ${tTextMain} ${tSelection} font-sans relative flex`}>
          
          {/* Subtle Noise overlay */}
          <div 
            className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-[0.03] mix-blend-screen' : 'opacity-[0.04] mix-blend-multiply'}`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
          />

          {/* Glassmorphic Sidebar (Fixed) */}
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
            "transition-all duration-300 ease-in-out flex-1 flex flex-col relative z-10 min-h-screen",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            
            {/* Sticky Glassmorphic Topbar */}
            <header className={`sticky top-0 shrink-0 flex items-center justify-between h-20 px-8 md:px-12 backdrop-blur-md border-b transition-colors duration-500 z-30 ${isDark ? 'bg-[#020805]/80 border-white/[0.03]' : 'bg-[#F7F6F2]/80 border-black/[0.05]'}`}>
              <div className={`ml-4 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase transition-colors duration-500 ${isDark ? 'text-emerald-500/70' : 'text-emerald-800/70'}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDark ? 'bg-emerald-500' : 'bg-emerald-700'}`}></span>
                </span>
                Simulation Environment
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

            {/* Main Natural Scrolling Content */}
            <main className="flex-1 flex flex-col p-6 md:p-8">
              <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12">
                
                <AnimatePresence mode="wait">
                  {/* PRE-SIMULATION / LOADING STATE */}
                  {!showDetails ? (
                    <motion.div key="pre-sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex flex-col items-center justify-center border transition-colors duration-500 p-12 text-center min-h-[75vh] ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                      {loading ? (
                        <>
                          <IconActivity className={`w-12 h-12 animate-pulse mb-6 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`} stroke={1.2} />
                          <h2 className={`text-xs font-mono uppercase tracking-[0.2em] mb-2 ${tTextMain}`}>Running Simulation</h2>
                          <p className={`text-[10px] font-mono uppercase tracking-widest ${tTextSub}`}>Calculating probabilistic financial outcomes...</p>
                        </>
                      ) : (
                        <>
                          <div className={`mb-6 flex justify-center ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                            <IconSparkles className="w-12 h-12" stroke={1.2} />
                          </div>
                          <h1 className={`${libreBaskerville.className} text-3xl md:text-4xl tracking-tighter mb-4`}>
                            Predictive <span className={`italic ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Modeling.</span>
                          </h1>
                          <p className={`text-[11px] font-mono uppercase tracking-widest mb-10 mx-auto max-w-lg leading-relaxed ${tTextSub}`}>
                            Initiate the simulator to generate personalized financial scenarios based on your current ledger trajectory.
                          </p>
                          <button
                            onClick={runSimulation}
                            className={`h-12 px-10 border text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all ${isDark ? 'bg-emerald-500 text-[#020805] hover:bg-emerald-400 border-emerald-400' : 'bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700 border-emerald-900'}`}
                          >
                            EXECUTE SIMULATION
                          </button>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    // POST-SIMULATION STATE (Natural browser scrolling)
                    <motion.div key="post-sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8 w-full">
                      
                      {/* Header with Recalculate Button */}
                      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                        <div>
                          <p className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-2 transition-colors duration-500 ${isDark ? 'text-emerald-400/60' : 'text-emerald-800/60'}`}>
                            Simulation Complete
                          </p>
                          <h1 className={`${libreBaskerville.className} text-3xl md:text-4xl tracking-tighter mix-blend-normal`}>
                            Trajectory <span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Analysis.</span>
                          </h1>
                        </div>
                        <button
                          onClick={runSimulation}
                          disabled={loading}
                          className={`flex items-center justify-center gap-2 h-10 px-6 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30' : 'border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/10'}`}
                        >
                          {loading ? <IconActivity className="w-3.5 h-3.5 animate-pulse" /> : <IconRefresh className="w-3.5 h-3.5" stroke={1.2} />} 
                          <span>{loading ? 'RECALCULATING' : 'RECALCULATE'}</span>
                        </button>
                      </div>

                      {/* Top Section: Personality & Achievements Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Personality Badge */}
                        {personality && (
                          <div className={`col-span-1 border p-8 flex flex-col items-center justify-center text-center transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                            <div className="mb-6">
                              {getPersonalityIcon(personality.type, isDark)}
                            </div>
                            <h2 className={`text-sm font-mono uppercase tracking-[0.2em] mb-3 ${tTextMain}`}>
                              {personality.type} Profile
                            </h2>
                            <p className={`text-[11px] font-mono leading-relaxed ${tTextSub}`}>
                              {personality.description}
                            </p>
                          </div>
                        )}

                        {/* Achievements Grid */}
                        {achievements.length > 0 && (
                          <div className={`col-span-1 md:col-span-2 border p-6 transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                            <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${tTextSub}`}>
                              <div className="w-1.5 h-1.5 bg-current opacity-50" /> Milestone Projection
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {achievements.map((achievement, idx) => (
                                <div key={idx} className={`border p-4 min-h-[120px] flex flex-col items-center justify-center text-center transition-all duration-500 ${achievement.unlocked ? (isDark ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-emerald-800/30 bg-emerald-800/5') : (isDark ? 'border-white/[0.02] bg-white/[0.01] opacity-40' : 'border-black/[0.05] bg-black/[0.02] opacity-50')}`}>
                                  <IconAward className={`w-6 h-6 mb-3 ${achievement.unlocked ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : tTextSub}`} stroke={1.2} />
                                  <h4 className={`text-[9px] font-mono uppercase tracking-widest leading-relaxed ${achievement.unlocked ? tTextMain : tTextSub}`}>
                                    {achievement.title}
                                  </h4>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scenarios Grid - Let this flow naturally */}
                      <div className="pt-6 border-t transition-colors duration-500 border-dashed border-white/[0.05]">
                        <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-8 flex items-center gap-2 ${tTextSub}`}>
                          <div className="w-1.5 h-1.5 bg-current opacity-50" /> Probabilistic Scenarios
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {scenarios.map((scenario, idx) => (
                            <div key={idx} className={`border p-6 flex flex-col transition-colors duration-500 hover:border-emerald-500/30 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                              <div className="flex items-center justify-between mb-6">
                                <div>{getScenarioIcon(scenario.icon, isDark)}</div>
                                <div className="text-right">
                                  <div className={`${libreBaskerville.className} text-2xl ${tTextMain}`}>
                                    {scenario.probability}%
                                  </div>
                                  <div className={`text-[8px] font-mono uppercase tracking-widest ${tTextSub}`}>
                                    Probability
                                  </div>
                                </div>
                              </div>
                              <h3 className={`text-xs font-mono uppercase tracking-[0.1em] mb-3 ${tTextMain}`}>
                                {scenario.title}
                              </h3>
                              <p className={`text-[10px] font-mono leading-relaxed mb-6 flex-1 ${tTextSub}`}>
                                {scenario.description}
                              </p>
                              
                              {/* Progress Bar */}
                              <div className={`w-full h-1 mt-auto ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.05]'}`}>
                                <div 
                                  className={`h-full transition-all duration-1000 ${isDark ? 'bg-emerald-400' : 'bg-emerald-700'}`}
                                  style={{ width: `${scenario.probability}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

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