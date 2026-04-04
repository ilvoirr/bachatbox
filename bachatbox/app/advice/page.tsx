"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
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
  IconSparkles,
  IconRefresh,
  IconLoader,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconShield,
  IconAward,
  IconBook,
  IconShieldCheck
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

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

// Updated AdviceCard Component with proper height handling
const AdviceCard = ({ title, content, icon, className, delay = 0 }: {
  title: string;
  content: string;
  icon: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={cn(
        "bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100",
        "flex flex-col justify-between", // Ensures content is distributed properly
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-black rounded-lg text-white flex-shrink-0">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
      </div>
      <p className="text-gray-700 leading-relaxed flex-1 flex items-center">{content}</p>
    </motion.div>
  );
};

// Updated ScoreCard Component with proper height handling
const ScoreCard = ({ score, status, delay = 0 }: {
  score: number;
  status: string;
  delay?: number;
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay }}
      className="bg-gradient-to-br from-[#ecf8e5] to-white rounded-2xl p-8 shadow-lg h-full flex flex-col justify-center items-center"
    >
      <div className="mb-4 text-center">
        <div className={cn("text-6xl font-bold", getScoreColor(score))}>
          {score}
        </div>
        <div className="text-gray-600 text-sm">Financial Health Score</div>
      </div>
      <div className="text-gray-800 font-medium text-center">{status}</div>
    </motion.div>
  );
};

export default function AdvicePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<string>('');
  const [adviceData, setAdviceData] = useState<AdviceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [layoutVariant, setLayoutVariant] = useState(0);

  // Local Storage Functions
  const getStorageKey = () => {
    return user?.id ? `bachatbox_${user.id}_transactions` : null;
  };

  const getBudgetKey = () => {
    return user?.id ? `bachatbox_${user.id}_budget` : null;
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

  const loadBudget = () => {
    const key = getBudgetKey();
    if (key) {
      const storedBudget = localStorage.getItem(key);
      if (storedBudget) {
        return storedBudget;
      }
    }
    return '';
  };

  // Load data on mount
  useEffect(() => {
    if (isLoaded && user?.id) {
      const storedTransactions = loadTransactions();
      setTransactions(storedTransactions);
      const storedBudget = loadBudget();
      setBudget(storedBudget);
    }
  }, [isLoaded, user?.id]);

  // Generate AI advice
  const generateAdvice = async () => {
    if (transactions.length === 0) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          budget,
          userId: user?.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setAdviceData(data.advice);
        // Randomize layout for next generation
        setLayoutVariant(Math.floor(Math.random() * 3));
      }
    } catch (error) {
      console.error('Error generating advice:', error);
    } finally {
      setIsLoading(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Calculate quick stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Layout variants with FIXED HEIGHT DISTRIBUTION
  const renderAdviceDashboard = () => {
    if (!adviceData) return null;

    const layouts = [
      // Layout 1: Grid with score prominently displayed - FIXED HEIGHT DISTRIBUTION
      <div key="layout1" className="grid grid-cols-12 grid-rows-6 gap-6 h-full">
        <div className="col-span-4 row-span-4 flex">
          <div className="flex-1">
            <ScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} />
          </div>
        </div>
        <div className="col-span-8 row-span-4 grid grid-cols-2 gap-4 h-full">
          <AdviceCard
            title="Top Spending"
            content={adviceData.topSpending}
            icon={<IconTrendingDown className="w-5 h-5" />}
            delay={0.4}
            className="h-full"
          />
          <AdviceCard
            title="Savings Opportunity"
            content={adviceData.savingsOpportunity}
            icon={<IconTarget className="w-5 h-5" />}
            delay={0.6}
            className="h-full"
          />
          <AdviceCard
            title="Monthly Trend"
            content={adviceData.monthlyTrend}
            icon={<IconTrendingUp className="w-5 h-5" />}
            delay={0.8}
            className="col-span-2 h-full"
          />
        </div>
        <div className="col-span-12 row-span-2 grid grid-cols-3 gap-4 h-full">
          {adviceData.recommendations.slice(0, 3).map((rec, idx) => (
            <AdviceCard
              key={idx}
              title={`Recommendation ${idx + 1}`}
              content={rec}
              icon={<IconSparkles className="w-5 h-5" />}
              delay={1 + idx * 0.2}
              className="h-full"
            />
          ))}
        </div>
      </div>,

      // Layout 2: Vertical flow with insights - FIXED HEIGHT DISTRIBUTION
      <div key="layout2" className="flex gap-6 h-full">
        <div className="flex-1 flex flex-col space-y-4 h-full">
          <div className="flex-1">
            <ScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} />
          </div>
          <div className="flex-1">
            <AdviceCard
              title="Budget Analysis"
              content={adviceData.budgetStatus}
              icon={<IconShield className="w-5 h-5" />}
              delay={0.4}
              className="h-full"
            />
          </div>
        </div>
        <div className="flex-2 grid grid-rows-4 gap-4 h-full">
          <AdviceCard
            title="Key Insight"
            content={adviceData.insights[0] || "Track your spending patterns"}
            icon={<IconBrain className="w-5 h-5" />}
            delay={0.6}
            className="row-span-1 h-full"
          />
          {adviceData.goals.slice(0, 3).map((goal, idx) => (
            <AdviceCard
              key={idx}
              title={`Goal ${idx + 1}`}
              content={goal}
              icon={<IconTarget className="w-5 h-5" />}
              delay={0.8 + idx * 0.2}
              className="row-span-1 h-full"
            />
          ))}
        </div>
      </div>,

      // Layout 3: Masonry-style asymmetric layout - FIXED HEIGHT DISTRIBUTION
      <div key="layout3" className="grid grid-cols-4 grid-rows-4 gap-4 h-full">
        <div className="col-span-2 row-span-3">
          <ScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} />
        </div>
        <div className="col-span-2 row-span-2 grid grid-rows-2 gap-4 h-full">
          <AdviceCard
            title="Smart Insight"
            content={adviceData.insights[0] || "AI analyzed your patterns"}
            icon={<IconBrain className="w-5 h-5" />}
            delay={0.4}
            className="h-full"
          />
          <AdviceCard
            title="Savings Focus"
            content={adviceData.savingsOpportunity}
            icon={<IconTarget className="w-5 h-5" />}
            delay={0.6}
            className="h-full"
          />
        </div>
        <div className="col-span-2 row-span-1">
          <AdviceCard
            title="Budget Status"
            content={adviceData.budgetStatus}
            icon={<IconShield className="w-5 h-5" />}
            delay={0.7}
            className="h-full"
          />
        </div>
        <div className="col-span-4 row-span-1 grid grid-cols-3 gap-4 h-full">
          {adviceData.recommendations.slice(0, 3).map((rec, idx) => (
            <AdviceCard
              key={idx}
              title={`Action ${idx + 1}`}
              content={rec}
              icon={<IconSparkles className="w-5 h-5" />}
              delay={0.8 + idx * 0.2}
              className="h-full"
            />
          ))}
        </div>
      </div>
    ];

    return layouts[layoutVariant];
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

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-white">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-[90.5vh] bg-gradient-to-br from-[#ecf8e5] to-white"
                  >
                    <div className="text-center">
                      <IconLoader className="w-16 h-16 animate-spin text-black mx-auto mb-4" />
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Analyzing Your Finances</h2>
                      <p className="text-gray-600">AI is processing your financial data...</p>
                    </div>
                  </motion.div>
                ) : adviceData ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 h-[90.5vh] flex flex-col"
                  >
                    {/* Generate New Advice Button */}
                    <div className="mb-6 flex justify-between items-center flex-shrink-0">
                      <h1 className="text-3xl ml-26  font-bold text-gray-900">AI Financial Dashboard</h1>
                      <button
                        onClick={generateAdvice}
                        className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                      >
                        <IconRefresh className="w-5 h-5" />
                        Regenerate
                      </button>
                    </div>
                    
                    {/* Dynamic Dashboard Layout - THIS IS THE KEY FIX */}
                    <div className="flex-1 ml-8 min-h-0">
                      {renderAdviceDashboard()}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-6xl mx-auto p-6 h-[90.5vh] flex items-center justify-center"
                  >
                    {transactions.length > 0 ? (
                      <div className="text-center">
                        
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Financial Advisor</h1>
                        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                          Ready to analyze your financial data and provide personalized insights
                        </p>
                        
                        {/* Quick Stats Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-sm text-gray-600">Total Income</div>
                            <div className="text-xl font-semibold text-black">{formatCurrency(totalIncome)}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-sm text-gray-600">Total Expenses</div>
                            <div className="text-xl font-semibold text-black">{formatCurrency(totalExpenses)}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-sm text-gray-600">Net Balance</div>
                            <div className={`text-xl font-semibold ${balance >= 0 ? 'text-black' : 'text-red-600'}`}>
                              {formatCurrency(balance)}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={generateAdvice}
                          className="inline-flex items-center gap-3 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          
                          Generate AI Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-12 text-center">
                        <IconChartBar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Financial Data Available</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Add some income and expense transactions to get personalized financial advice from our AI advisor.
                        </p>
                        <button
                          onClick={() => router.push('/apppage')}
                          className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                        >
                          Add Transactions
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
