"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
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

export default function SplitWisePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State management
  const [friends, setFriends] = useState<Friend[]>([]);
  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Modal states
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<SplitExpense | null>(null);

  // Form states
  const [friendForm, setFriendForm] = useState({ name: '', email: '' });
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    paidBy: 'You',
    splitWith: [] as string[],
    category: 'Food'
  });

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

  // Storage functions
  const getStorageKey = (type: 'friends' | 'splitexpenses' | 'transactions') => {
    return user?.id ? `bachatbox_${user.id}_${type}` : null;
  };

  const saveToStorage = (type: 'friends' | 'splitexpenses', data: any[]) => {
    const key = getStorageKey(type);
    if (key) {
      localStorage.setItem(key, JSON.stringify(data));
    }
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

  // Load data on component mount
  useEffect(() => {
    if (isLoaded && user?.id) {
      setFriends(loadFromStorage('friends'));
      setSplitExpenses(loadFromStorage('splitexpenses'));
      setTransactions(loadFromStorage('transactions'));
    }
  }, [isLoaded, user?.id]);

  // Calculate balance from main balance sheet
  const calculateMainBalance = () => {
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'income' 
        ? total + transaction.amount 
        : total - transaction.amount;
    }, 0);
  };

  // Calculate total expenses from main balance sheet
  const calculateTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  // FIXED: Calculate splitwise balances with proper logic
  const calculateSplitBalances = () => {
    const balances: { [key: string]: number } = {};
    
    // Initialize balances
    friends.forEach(friend => {
      balances[friend.name] = 0;
    });
    balances['You'] = 0;

    // Calculate from split expenses
    splitExpenses.forEach(expense => {
      // Create a list of all people involved (including payer)
      const allPeople = new Set([expense.paidBy, ...expense.splitWith]);
      const totalPeople = allPeople.size;
      const perPerson = expense.amount / totalPeople;

      // Each person owes their share
      allPeople.forEach(person => {
        if (person !== expense.paidBy) {
          // This person owes the payer their share
          balances[person] -= perPerson;
          balances[expense.paidBy] += perPerson;
        }
      });
    });

    return balances;
  };

  const splitBalances = calculateSplitBalances();

  // CRUD Operations
  const addFriend = () => {
    if (!friendForm.name.trim() || !friendForm.email.trim()) return;

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: friendForm.name.trim(),
      email: friendForm.email.trim(),
      createdAt: new Date()
    };

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

    // Remove friend from existing expenses
    const updatedExpenses = splitExpenses.map(expense => ({
      ...expense,
      splitWith: expense.splitWith.filter(name => name !== friendToDelete.name)
    }));
    setSplitExpenses(updatedExpenses);
    saveToStorage('splitexpenses', updatedExpenses);
  };

  const addOrUpdateExpense = () => {
    if (!expenseForm.title.trim() || !expenseForm.amount || expenseForm.splitWith.length === 0) return;

    const amount = parseFloat(expenseForm.amount);
    
    // FIXED: Calculate per person amount correctly
    const allPeople = new Set([expenseForm.paidBy, ...expenseForm.splitWith]);
    const totalPeople = allPeople.size;
    const perPersonAmount = amount / totalPeople;

    const expenseData = {
      title: expenseForm.title.trim(),
      amount,
      paidBy: expenseForm.paidBy,
      splitWith: expenseForm.splitWith,
      category: expenseForm.category,
      perPersonAmount,
      settled: false
    };

    let updatedExpenses;

    if (editingExpense) {
      updatedExpenses = splitExpenses.map(exp => 
        exp.id === editingExpense.id 
          ? { ...expenseData, id: editingExpense.id, date: editingExpense.date }
          : exp
      );
    } else {
      const newExpense: SplitExpense = {
        ...expenseData,
        id: Date.now().toString(),
        date: new Date()
      };
      updatedExpenses = [newExpense, ...splitExpenses];
    }

    setSplitExpenses(updatedExpenses);
    saveToStorage('splitexpenses', updatedExpenses);

    // Reset form
    setExpenseForm({
      title: '',
      amount: '',
      paidBy: 'You',
      splitWith: [],
      category: 'Food'
    });
    setEditingExpense(null);
    setShowAddExpense(false);
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = splitExpenses.filter(exp => exp.id !== id);
    setSplitExpenses(updatedExpenses);
    saveToStorage('splitexpenses', updatedExpenses);
  };

  const editExpense = (expense: SplitExpense) => {
    setExpenseForm({
      title: expense.title,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      splitWith: expense.splitWith,
      category: expense.category
    });
    setEditingExpense(expense);
    setShowAddExpense(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Math.abs(amount));
  };

  // FIXED: Color logic for friends based on who paid
  const getFriendBalanceColor = (friendName: string, balance: number) => {
    if (balance === 0) return 'text-gray-500';
    
    // Check if user has any expenses where they paid and this friend was involved
    const userPaidForFriend = splitExpenses.some(expense => 
      expense.paidBy === 'You' && expense.splitWith.includes(friendName)
    );
    
    // Check if friend has any expenses where they paid and user was involved  
    const friendPaidForUser = splitExpenses.some(expense => 
      expense.paidBy === friendName && expense.splitWith.includes('You')
    );

    if (balance > 0) {
      // Friend owes you money
      return userPaidForFriend ? 'text-green-600' : 'text-red-600';
    } else {
      // You owe friend money  
      return friendPaidForUser ? 'text-red-600' : 'text-green-600';
    }
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

            {/* Main Content Area - SplitWise Dashboard */}
            <div className="p-8">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl m-6 font-bold text-gray-900 mb-2">SplitWise Dashboard</h1>
                  <p className="m-6 text-gray-600">Manage your shared expenses and settle up with friends</p>
                </div>

                {/* Balance Summary Cards */}
                <div className="grid grid-cols-1 ml-4 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Main Balance</p>
                        <p className={`text-2xl font-bold ${calculateMainBalance() >= 0 ? 'text-black' : 'text-red-600'}`}>
                          {formatCurrency(calculateMainBalance())}
                        </p>
                        <p className="text-xs text-gray-400">From your balance sheet</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <IconReceipt className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(calculateTotalExpenses())}
                        </p>
                        <p className="text-xs text-gray-400">{transactions.filter(t => t.type === 'expense').length} expenses</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <IconChartBar className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Split Balance</p>
                        <p className={`text-2xl font-bold ${splitBalances['You'] > 0 ? 'text-green-600' : splitBalances['You'] < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {splitBalances['You'] > 0 ? '+' : ''}{formatCurrency(splitBalances['You'] || 0)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {splitBalances['You'] > 0 ? 'You are owed' : splitBalances['You'] < 0 ? 'You owe' : 'All settled'}
                        </p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <IconUsers className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Split Expenses */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900">Split Expenses</h2>
                          <button
                            onClick={() => setShowAddExpense(true)}
                            className="bg-gray-900 hover:shadow-3xl text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <IconPlus className="w-4 h-4" />
                            Add Expense
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {splitExpenses.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              No split expenses yet. Add your first expense to get started!
                            </div>
                          ) : (
                            splitExpenses.map((expense) => (
                              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-blue-100 p-2 rounded-full">
                                    <IconReceipt className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{expense.title}</p>
                                    <p className="text-sm text-gray-500">
                                      Paid by {expense.paidBy} • Split with {expense.splitWith.join(', ')}
                                    </p>
                                    <p className="text-xs text-gray-400">{expense.date.toLocaleDateString('en-IN')}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                                    <p className="text-sm text-gray-600">{formatCurrency(expense.perPersonAmount)} per person</p>
                                  </div>
                                  <button
                                    onClick={() => editExpense(expense)}
                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  >
                                    <IconEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteExpense(expense.id)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  >
                                    <IconTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Friends & Balances */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900">Friends & Balances</h2>
                          <button
                            onClick={() => setShowAddFriend(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <IconPlus className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {friends.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No friends added yet. Add friends to start splitting expenses!
                            </div>
                          ) : (
                            friends.map((friend) => (
                              <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                      {friend.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{friend.name}</p>
                                    <p className="text-xs text-gray-500">{friend.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-semibold ${getFriendBalanceColor(friend.name, splitBalances[friend.name] || 0)}`}>
                                    {splitBalances[friend.name] > 0 && '+'}
                                    {formatCurrency(splitBalances[friend.name] || 0)}
                                  </span>
                                  <button
                                    onClick={() => deleteFriend(friend.id)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  >
                                    <IconTrash className="w-3 h-3" />
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
              </div>
            </div>
          </div>

          {/* Add Friend Modal */}
          {showAddFriend && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Friend</h3>
                  <button
                    onClick={() => {
                      setShowAddFriend(false);
                      setFriendForm({ name: '', email: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={friendForm.name}
                      onChange={(e) => setFriendForm({...friendForm, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ed321] focus:border-transparent"
                      placeholder="Enter friend's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={friendForm.email}
                      onChange={(e) => setFriendForm({...friendForm, email: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ed321] focus:border-transparent"
                      placeholder="Enter friend's email"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={addFriend}
                    className="flex-1 bg-[#7ed321] hover:bg-[#6bc91a] text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Add Friend
                  </button>
                  <button
                    onClick={() => {
                      setShowAddFriend(false);
                      setFriendForm({ name: '', email: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Expense Modal */}
          {showAddExpense && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingExpense ? 'Edit Expense' : 'Add Split Expense'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddExpense(false);
                      setEditingExpense(null);
                      setExpenseForm({
                        title: '',
                        amount: '',
                        paidBy: 'You',
                        splitWith: [],
                        category: 'Food'
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={expenseForm.title}
                      onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ed321] focus:border-transparent"
                      placeholder="Enter expense description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ed321] focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
                    <select
                      value={expenseForm.paidBy}
                      onChange={(e) => setExpenseForm({...expenseForm, paidBy: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ed321] focus:border-transparent"
                    >
                      <option value="You">You</option>
                      {friends.map(friend => (
                        <option key={friend.id} value={friend.name}>{friend.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Split with</label>
                    {friends.length === 0 ? (
                      <p className="text-sm text-gray-500 p-2 border rounded-lg bg-gray-50">
                        Add friends first to split expenses with them
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={expenseForm.splitWith.includes('You')}
                            onChange={(e) => {
                              const newSplitWith = e.target.checked 
                                ? [...expenseForm.splitWith, 'You']
                                : expenseForm.splitWith.filter(p => p !== 'You');
                              setExpenseForm({...expenseForm, splitWith: newSplitWith});
                            }}
                            className="mr-2 text-[#7ed321] focus:ring-[#7ed321]"
                          />
                          You
                        </label>
                        {friends.map(friend => (
                          <label key={friend.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={expenseForm.splitWith.includes(friend.name)}
                              onChange={(e) => {
                                const newSplitWith = e.target.checked 
                                  ? [...expenseForm.splitWith, friend.name]
                                  : expenseForm.splitWith.filter(p => p !== friend.name);
                                setExpenseForm({...expenseForm, splitWith: newSplitWith});
                              }}
                              className="mr-2 text-[#7ed321] focus:ring-[#7ed321]"
                            />
                            {friend.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ed321] focus:border-transparent"
                    >
                      <option value="Food">Food</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Travel">Travel</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={addOrUpdateExpense}
                    disabled={friends.length === 0 || expenseForm.splitWith.length === 0}
                    className="flex-1 bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {editingExpense ? 'Update' : 'Add'} Expense
                  </button>
                  <button
                    onClick={() => {
                      setShowAddExpense(false);
                      setEditingExpense(null);
                      setExpenseForm({
                        title: '',
                        amount: '',
                        paidBy: 'You',
                        splitWith: [],
                        category: 'Food'
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
