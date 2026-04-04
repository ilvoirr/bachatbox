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
  IconBadge,
  IconUser,
  IconBook,
  IconShieldCheck
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

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

// Helper function to get appropriate icon for scenario
const getScenarioIcon = (iconString: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    // Financial icons
    'money': <IconCoin className="h-8 w-8" />,
    'savings': <IconPigMoney className="h-8 w-8" />,
    'wallet': <IconWallet className="h-8 w-8" />,
    'card': <IconCreditCard className="h-8 w-8" />,
    'trending-up': <IconTrendingUp className="h-8 w-8" />,
    'trending-down': <IconTrendingDown className="h-8 w-8" />,
    'shopping': <IconShoppingCart className="h-8 w-8" />,
    'home': <IconHome className="h-8 w-8" />,
    'car': <IconCar className="h-8 w-8" />,
    'plane': <IconPlane className="h-8 w-8" />,
    'coffee': <IconCoffee className="h-8 w-8" />,
    'alert': <IconAlertTriangle className="h-8 w-8" />,
    'target': <IconTarget className="h-8 w-8" />,
    'chart': <IconChartBar className="h-8 w-8" />,
    // Default fallback
    'default': <IconSparkles className="h-8 w-8" />
  };

  return iconMap[iconString] || iconMap['default'];
};

// Helper function to get personality icon
const getPersonalityIcon = (type: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'saver': <IconPigMoney className="h-16 w-16" />,
    'spender': <IconShoppingCart className="h-16 w-16" />,
    'investor': <IconTrendingUp className="h-16 w-16" />,
    'balanced': <IconTarget className="h-16 w-16" />,
    'default': <IconUser className="h-16 w-16" />
  };

  const key = type.toLowerCase();
  return iconMap[key] || iconMap['default'];
};

export default function SimulatorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -------------------- Simulator State --------------------
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // NEW: Track if details are shown

  // -------------------- LocalStorage Key (SAME AS APPPAGE.TSX) --------------------
  const getStorageKey = () => {
    return user?.id ? `bachatbox_${user.id}_transactions` : null;
  };

  // -------------------- Simulator Logic --------------------
  const runSimulation = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Get data from localStorage using SAME KEY as apppage.tsx
      const key = getStorageKey();
      if (!key) {
        alert('User ID not available');
        setLoading(false);
        return;
      }

      const transactionsData = localStorage.getItem(key);
      let transactions: Transaction[] = [];
      
      if (transactionsData) {
        try {
          const parsed = JSON.parse(transactionsData);
          transactions = parsed.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp)
          }));
        } catch (error) {
          console.error('Error parsing transactions:', error);
        }
      }
      
      if (transactions.length === 0) {
        alert('No transaction data found! Add some expenses first in your Balance Sheet.');
        setLoading(false);
        return;
      }

      // Call your Next.js API route instead of Flask
      const response = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
      });
      
      if (!response.ok) {
        throw new Error('Simulation API failed');
      }
      
      const result = await response.json();
      setScenarios(result.scenarios || []);
      setPersonality(result.personality || null);
      setAchievements(result.achievements || []);
      setShowDetails(true); // NEW: Show details and hide button
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed! Make sure you have transaction data first.');
    } finally {
      setLoading(false);
    }
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
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="ml-4 text-2xl font-bold text-black">What-If Simulator</h1>
                    <p className="text-sm ml-4 text-gray-600">Explore your financial future with AI-powered predictions</p>
                  </div>
                </div>
              </div>
              
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

            {/* ============================================================
                MAIN SIMULATOR CONTENT AREA
            ============================================================ */}
            <div className="min-h-[91vh] bg-[#ecf8e5] p-8">
              {/* Run Simulation Button - ONLY SHOW IF NO DETAILS */}
              {!showDetails && (
                <div className="text-center mb-6">
                  <button
                    onClick={runSimulation}
                    disabled={loading}
                    className="bg-white text-black px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-3 mx-auto hover:bg-gray-100"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                        Running Simulation...
                      </>
                    ) : (
                      <>
                        <IconAward className="h-6 w-6" />
                        Challenges Won
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Personality Badge - ONLY SHOW IF DETAILS VISIBLE */}
              {showDetails && personality && (
                <div className="bg-white ml-4 rounded-xl shadow-lg p-6 text-center border-2 border-black border-opacity-20 mb-6">
                  <div className="flex justify-center mb-4 text-black">
                    {getPersonalityIcon(personality.type)}
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">{personality.type}</h2>
                  <p className="text-gray-600">{personality.description}</p>
                </div>
              )}

              {/* Scenarios Grid - ONLY SHOW IF DETAILS VISIBLE */}
              {showDetails && (
                <div className="ml-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                  {scenarios.map((scenario, idx) => (
                    <div key={idx} className="bg-white border-2 border-black rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-black">
                          {getScenarioIcon(scenario.icon)}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-black">{scenario.probability}%</div>
                          <div className="text-sm text-gray-600">probability</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-black">{scenario.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{scenario.description}</p>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div
                          className="bg-black h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${scenario.probability}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements Section - ONLY SHOW IF DETAILS VISIBLE */}
              {showDetails && achievements.length > 0 && (
                <div className="ml-4 mb-6">
                  <h3 className="text-2xl font-bold text-black mb-4">Financial Achievements</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {achievements.map((achievement, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border-2 ${achievement.unlocked ? 'bg-white border-black' : 'bg-gray-100 border-gray-300'}`}>
                        <div className={`text-center ${achievement.unlocked ? 'text-black' : 'text-gray-400'}`}>
                          <IconAward className="h-8 w-8 mx-auto mb-2" />
                          <h4 className="font-semibold text-sm">{achievement.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Card - ONLY SHOW IF NO DETAILS AND NOT LOADING */}
              {!showDetails && !loading && (
                <div className="bg-white ml-4 rounded-xl shadow-lg p-8 text-center border-2 border-black border-opacity-20">
                  <IconChartBar className="h-16 w-16 text-black mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-black mb-3">Ready for Financial Insights?</h3>
                  <p className="text-gray-600 text-lg mb-4">
                    Our What-If Simulator will analyze your spending patterns and generate personalized financial scenarios.
                  </p>
                  <p className="text-sm text-gray-500">
                    Make sure you have some transaction data in your Balance Sheet first!
                  </p>
                </div>
              )}
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
