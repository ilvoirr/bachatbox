"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
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
  IconChevronUp,
  IconChevronDown,
  IconSparkles,
  IconBook,
  IconTrendingUp,
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
  timestamp: Date;
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

// Simple Chart Components
const PieChart = ({ data, title }: { data: any[], title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const colors = ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg width="256" height="256" viewBox="0 0 256 256" className="transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="100"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="20"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 6.28} 628`;
              const strokeDashoffset = -cumulativePercentage * 6.28;
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="128"
                  cy="128"
                  r="100"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">₹{total.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              ₹{item.value.toLocaleString()} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Updated BarChart component to include both income/expenses and top expenses
const CombinedBarChart = ({ incomeExpenseData, topExpenses, title }: { 
  incomeExpenseData: any[], 
  topExpenses: any[], 
  title: string 
}) => {
  // Combine all data for calculating max value
  const allData = [...incomeExpenseData, ...topExpenses];
  const maxValue = Math.max(...allData.map(item => item.value));

  const getBarColor = (name: string, isTopExpense: boolean = false) => {
    if (name.toLowerCase().includes('income')) {
      return 'bg-black';
    } else if (name.toLowerCase().includes('expense') && !isTopExpense) {
      return 'bg-black';
    } else if (isTopExpense) {
      return 'bg-gray-800';
    }
    return 'bg-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <div className="space-y-3">
        {/* Income vs Expenses */}
        {incomeExpenseData.map((item, index) => (
          <div key={`main-${index}`} className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700 mr-4">
              {item.name}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-10 relative">
              <div
                className={`${getBarColor(item.name)} h-10 rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                <span className="text-white text-sm font-semibold">
                  ₹{item.value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Divider */}
        {topExpenses.length > 0 && (
          <div className=" pt-18 mt-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Expense Categories</h4>
          </div>
        )}

        {/* Top Expenses */}
          {topExpenses.map((item, index) => (
            <div key={`expense-${index}`} className="flex items-center">
              <div className="w-32 text-sm font-medium text-gray-700 mr-4">
                {item.name}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                <div
                  className={`${getBarColor(item.name, true)} h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                >

                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const LineChart = ({ data, title }: { data: any[], title: string }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">{title}</h3>
      <div className="relative h-64">
        <svg width="100%" height="100%" className="overflow-visible">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#1f2937" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0%"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Line path */}
          <path
            d={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
            }).join(' ')}
            fill="none"
            stroke="#1f2937"
            strokeWidth="3"
            className="transition-all duration-500"
          />
          
          {/* Area under curve */}
          <path
            d={`${data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
            }).join(' ')} L 100% 100% L 0% 100% Z`}
            fill="url(#lineGradient)"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#1f2937"
                className="transition-all duration-300 hover:r-6"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-4 text-sm text-gray-600">
          {data.map((item, index) => (
            <span key={index}>{item.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function VisualisePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Budget state
  const [budget, setBudget] = useState<string>('');

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

  // Load transactions and budget on mount
  useEffect(() => {
    if (isLoaded && user?.id) {
      const storedTransactions = loadTransactions();
      setTransactions(storedTransactions);
      const storedBudget = loadBudget();
      setBudget(storedBudget);
    }
  }, [isLoaded, user?.id]);

  // Save budget to localStorage with user key
  const saveBudget = () => {
    const key = getBudgetKey();
    if (key && budget.trim()) {
      localStorage.setItem(key, budget.trim());
      
    }
  };

  // Budget adjustment functions
  const increaseBudget = () => {
    const currentBudget = parseInt(budget || '0');
    setBudget((currentBudget + 1000).toString());
  };

  const decreaseBudget = () => {
    const currentBudget = parseInt(budget || '0');
    const newBudget = Math.max(0, currentBudget - 1000);
    setBudget(newBudget.toString());
  };

  // Calculate statistics
  const calculateStats = () => {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Group expenses by description for pie chart
    const expenseByCategory = expenses.reduce((acc, t) => {
      const category = t.description || 'Other';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Get top 4 expenses
    const topExpenses = Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    const maxExpense = topExpenses.length > 0 ? topExpenses[0].value : 0;

    // Monthly data for line chart
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.timestamp).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expense += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number, expense: number }>);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      expenseByCategory: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })),
      topExpenses,
      maxExpense,
      monthlyData: Object.entries(monthlyData).map(([name, data]) => ({ 
        name, 
        income: data.income, 
        expense: data.expense,
        value: data.expense 
      }))
    };
  };

  const stats = calculateStats();
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

            {/* Visualisation Content */}
            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-7xl mx-auto">
                
                {transactions.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <IconChartBar className="w-16 h-16 mx-auto" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h2>
                    <p className="text-gray-500">Add some transactions to see your financial analytics here.</p>
                    <button
                      onClick={() => router.push('/apppage')}
                      className="mt-6 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      Add Transactions
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Overview Cards */}
                    <div className="grid ml-4 grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Total Income</div>
                          <div className="text-3xl font-bold text-green-900">
                            {formatCurrency(stats.totalIncome)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
                          <div className="text-3xl font-bold text-red-900">
                            {formatCurrency(stats.totalExpenses)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Net Balance</div>
                          <div className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-black' : 'text-red-600'}`}>
                            {formatCurrency(stats.balance)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Budget Input Section */}
                    <div className="flex justify-center mb-6">
                      <div className="flex items-center bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                        
                        <input
                          type="number"
                          step="1000"
                          placeholder="Enter your monthly budget"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-80 px-6 py-4 text-lg font-medium text-gray-700 bg-white focus:outline-none focus:ring-0 border-none text-center"
                        />
                        
                        <button
                          onClick={saveBudget}
                          className="bg-[black] text-white px-8 py-4 text-lg font-semibold hover:bg-gray-800 transition-all duration-200 shadow-inner"
                        >
                          Add Budget
                        </button>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid ml-4 grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Expense Breakdown Pie Chart */}
                      {stats.expenseByCategory.length > 0 && (
                        <PieChart 
                          data={stats.expenseByCategory} 
                          title="Expenses by Category" 
                        />
                      )}
                      
                      {/* Combined Income vs Expenses + Top Expenses Bar Chart */}
                      <CombinedBarChart
                        incomeExpenseData={[
                          { name: 'Total Income', value: stats.totalIncome },
                          { name: 'Total Expenses', value: stats.totalExpenses }
                        ]}
                        topExpenses={stats.topExpenses}
                        title="Income vs Expenses"
                      />
                    </div>
                  </>
                )}
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
// Note: Ensure you have the necessary environment variable GEMINI_API_KEY set for the Google Generative AI to work.
