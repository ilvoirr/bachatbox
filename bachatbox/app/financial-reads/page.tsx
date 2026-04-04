"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
import {
  IconReceipt,
  IconChartBar,
  IconTable,
  IconMessageCircle,
  IconUsers,
  IconBook,
  IconSparkles,
  IconPlus,
  IconX,
  IconChevronUp,
  IconTrendingUp,
  IconShieldCheck
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
interface FinancialArticle {
  id: number;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  tags: string[];
  upvotes: number;
  author: string;
  createdAt: string;
}

type ExpandedState = { [key: number]: boolean };

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

export default function FinancialReadsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Articles State
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [articles, setArticles] = useState<FinancialArticle[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    readTime: '',
    summary: '',
    content: '',
    tags: ''
  });

  // Load articles
  useEffect(() => {
    const savedArticles = localStorage.getItem('financialArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      const defaultArticles: FinancialArticle[] = [
        {
          id: 1,
          title: "Emergency Fund Essentials: Your Financial Safety Net",
          category: "Personal Finance Basics",
          readTime: "5 min read",
          summary: "Learn why having 3-6 months of expenses saved is crucial and how to build your emergency fund systematically.",
          content: `An emergency fund represents one of the most fundamental pillars of personal financial security, yet countless individuals find themselves navigating life without this crucial safety net. Think of your emergency fund as a financial cushion that stands between you and potential financial catastrophe when unexpected expenses arise.

Life has a way of throwing curveballs when we least expect them. Your car breaks down on the way to an important job interview. A medical emergency requires immediate attention and costly treatment. Your employer announces sudden layoffs, leaving you without income. Your home's heating system fails during the coldest week of winter. These scenarios aren't just hypothetical possibilities but real situations that millions of people face every year.

Without an emergency fund, these unexpected events often force individuals into a cycle of debt. They reach for credit cards, take out personal loans with high interest rates, or worse, borrow against retirement accounts. Each of these solutions creates additional financial stress and can derail long-term financial goals.

**The Golden Rule**
The general recommendation suggests maintaining three to six months of living expenses in your emergency fund. However, this range isn't arbitrary. The appropriate amount depends on several personal factors including job security, health status, number of dependents, and overall financial stability. Someone with a stable government job might feel comfortable with three months of expenses, while a freelancer or commission-based worker might prefer six months or more.

Calculating your emergency fund target requires honest assessment of your essential monthly expenses. Include housing costs like rent or mortgage payments, utilities, groceries, insurance premiums, minimum debt payments, and transportation costs. Don't include discretionary spending like entertainment, dining out, or hobby expenses, as these can be eliminated during an emergency.

Building an emergency fund from scratch can feel overwhelming, especially when living paycheck to paycheck. The key lies in starting small and building momentum. Begin with a micro-goal of saving just $500. This amount can cover many minor emergencies like a small car repair or medical co-pay. Once you reach this milestone, gradually increase your target.`,
          tags: ["Emergency Fund", "Savings", "Financial Security"],
          upvotes: 15,
          author: "BachatBox Team",
          createdAt: "2025-09-01"
        },
        {
          id: 2,
          title: "The 50/30/20 Budget Rule Explained",
          category: "Budgeting",
          readTime: "4 min read",
          summary: "Master the simple budgeting framework that allocates 50% for needs, 30% for wants, and 20% for savings.",
          content: `The 50/30/20 budgeting rule has gained tremendous popularity among personal finance experts and everyday money managers because of its elegant simplicity and practical effectiveness. Created by Senator Elizabeth Warren during her time as a Harvard bankruptcy law professor, this framework provides a straightforward approach to managing money without getting bogged down in complicated spreadsheets or dozens of spending categories.

At its core, the 50/30/20 rule divides your after-tax income into three broad categories. Fifty percent goes toward needs, thirty percent toward wants, and twenty percent toward savings and debt repayment. This division strikes a balance between covering essential expenses, enjoying life in the present, and securing your financial future.

**1. Needs (50%)**
Needs represent expenses absolutely essential for survival and basic functioning in society. These include housing costs like rent or mortgage payments, utilities such as electricity and water, groceries for basic nutrition, transportation to work, insurance premiums, and minimum debt payments.

**2. Wants (30%)**
The wants category encompasses everything that enhances your quality of life but isn't strictly necessary for survival. This includes dining out, entertainment subscriptions, hobbies, gym memberships, personal care beyond basic necessities, and shopping for non-essential items.

**3. Savings & Debt (20%)**
The savings and debt repayment category serves dual purposes in building financial security. This 20% should first address high-interest debt, particularly credit card balances that can compound rapidly. Once high-interest debt is eliminated, focus shifts to building an emergency fund, contributing to retirement accounts, and saving for other financial goals.`,
          tags: ["Budgeting", "Money Management", "Financial Planning"],
          upvotes: 12,
          author: "BachatBox Team",
          createdAt: "2025-09-02"
        }
      ];
      setArticles(defaultArticles);
      localStorage.setItem('financialArticles', JSON.stringify(defaultArticles));
    }
  }, []);

  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('financialArticles', JSON.stringify(articles));
    }
  }, [articles]);

  const sortedArticles = [...articles].sort((a, b) => b.upvotes - a.upvotes);

  const toggleExpanded = (id: number) => {
    setIsExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpvote = (id: number) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, upvotes: a.upvotes + 1 } : a));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newArticle: FinancialArticle = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      readTime: formData.readTime,
      summary: formData.summary,
      content: formData.content,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      upvotes: 0,
      author: user?.username || user?.firstName || 'Anonymous',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setArticles(prev => [newArticle, ...prev]);
    setFormData({ title: '', category: '', readTime: '', summary: '', content: '', tags: '' });
    setShowCreateForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto no-scrollbar">
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
                Knowledge Base
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
            <main className="flex-1 p-6 md:p-10">
              <div className="max-w-4xl mx-auto space-y-10 pb-12">
                
                {/* Header Section */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b transition-colors duration-500 ${tBorder}`}>
                  <div>
                    <p className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-4 transition-colors duration-500 ${isDark ? 'text-emerald-400/60' : 'text-emerald-800/60'}`}>
                      Intel Repository
                    </p>
                    <h1 className={`${libreBaskerville.className} text-4xl md:text-5xl tracking-tighter mix-blend-normal mb-4`}>
                      Financial <span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Reads.</span>
                    </h1>
                    <p className={`font-mono text-[10px] uppercase tracking-widest max-w-lg leading-relaxed ${tTextSub}`}>
                      Master your capital allocation with essential financial literature. Build superior habits, one protocol at a time.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className={`h-12 px-8 border text-[10px] font-mono uppercase tracking-[0.15em] font-bold transition-all flex items-center gap-2 ${tBorder} ${isDark ? 'bg-white text-[#020805] hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
                  >
                    <IconPlus className="w-3.5 h-3.5" /> PUBLISH ARTICLE
                  </button>
                </div>

                {/* Articles Feed */}
                <div className="space-y-6">
                  {sortedArticles.map((article) => (
                    <article key={article.id} className={`border p-6 md:p-8 transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01] hover:bg-white/[0.02]' : 'bg-black/[0.01] hover:bg-black/[0.02]'}`}>
                      
                      {/* Meta Top */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 border text-[9px] font-mono uppercase tracking-widest ${isDark ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' : 'border-emerald-800/30 text-emerald-800 bg-emerald-800/10'}`}>
                            {article.category}
                          </span>
                          <span className={`font-mono text-[10px] uppercase tracking-widest ${tTextSub}`}>
                            BY {article.author}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <span className={`font-mono text-[10px] uppercase tracking-widest ${tTextSub}`}>
                            {article.readTime}
                          </span>
                          <button
                            onClick={() => handleUpvote(article.id)}
                            className={`flex items-center gap-1.5 transition-colors group ${tTextSub} hover:${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}
                          >
                            <IconChevronUp className={`w-4 h-4 transition-transform group-hover:-translate-y-0.5`} stroke={2} />
                            <span className="font-mono text-sm">{article.upvotes}</span>
                          </button>
                        </div>
                      </div>

                      {/* Title & Summary */}
                      <h2 className={`${libreBaskerville.className} text-2xl md:text-3xl mb-4 ${tTextMain}`}>
                        {article.title}
                      </h2>
                      <p className={`font-mono text-[11px] md:text-xs leading-loose mb-6 ${tTextSub}`}>
                        {article.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {article.tags.map((tag, index) => (
                          <span key={index} className={`px-2 py-1 text-[9px] font-mono uppercase tracking-[0.1em] border ${isDark ? 'border-white/[0.1] text-neutral-400' : 'border-black/[0.1] text-neutral-600'}`}>
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Read More Trigger */}
                      <button
                        onClick={() => toggleExpanded(article.id)}
                        className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold transition-colors ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-800 hover:text-emerald-700'}`}
                      >
                        {isExpanded[article.id] ? 'COLLAPSE TEXT' : 'EXPAND TEXT'}
                        <IconChevronUp className={`w-3 h-3 transition-transform duration-300 ${isExpanded[article.id] ? '' : 'rotate-180'}`} />
                      </button>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded[article.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mt-8 pt-8 border-t ${tBorder}`}
                          >
                            <div className={`font-sans text-sm md:text-base leading-loose max-w-none ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                              {article.content.split('\n').map((paragraph, index) => {
                                if (paragraph.trim() === '') return <br key={index} />;
                                
                                // Simple bold parsing (e.g. **Heading**)
                                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                  return (
                                    <h3 key={index} className={`font-bold text-lg mt-6 mb-3 ${tTextMain}`}>
                                      {paragraph.replace(/\*\*/g, '')}
                                    </h3>
                                  );
                                }
                                
                                // Numbered list or bullet matching
                                if (paragraph.trim().match(/^\d+\./) || paragraph.trim().startsWith('-')) {
                                  return (
                                    <p key={index} className="ml-6 mb-2 pl-2 border-l-2 border-emerald-500/50">
                                      {paragraph.trim()}
                                    </p>
                                  );
                                }
                                
                                return (
                                  <p key={index} className="mb-5">
                                    {paragraph.trim()}
                                  </p>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </article>
                  ))}
                </div>

                {/* --- MODAL FOR CREATING ARTICLE --- */}
                <AnimatePresence>
                  {showCreateForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans ${isDark ? 'bg-[#020805]/90' : 'bg-[#F7F6F2]/90'}`}>
                      <div className={`border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col ${isDark ? 'bg-[#020805] border-white/[0.1]' : 'bg-[#F7F6F2] border-black/[0.15]'}`}>
                        
                        <div className={`p-6 border-b flex items-center justify-between shrink-0 ${tBorder}`}>
                          <h3 className={`text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-3 ${tTextMain}`}>
                            <IconBook className="w-4 h-4" stroke={1.2} /> Initialize Publication
                          </h3>
                          <button onClick={() => setShowCreateForm(false)} className={`transition-colors ${tTextSub} hover:${isDark ? 'text-white' : 'text-black'}`}>
                            <IconX className="w-5 h-5" stroke={1.5} />
                          </button>
                        </div>

                        <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
                          <form id="article-form" onSubmit={handleFormSubmit} className="space-y-6">
                            
                            <div>
                              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Title</label>
                              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50' : 'border-black/[0.15] text-black focus:border-emerald-800/50'}`} placeholder="Article Title" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} required className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors appearance-none ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50' : 'border-black/[0.15] text-black focus:border-emerald-800/50'}`}>
                                  <option value="" className={isDark ? "bg-[#020805]" : "bg-white"}>Select Category</option>
                                  {["Personal Finance Basics", "Budgeting", "Investing", "Credit Management", "Insurance", "Tax Planning", "Retirement Planning"].map(cat => (
                                    <option key={cat} value={cat} className={isDark ? "bg-[#020805]" : "bg-white"}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Read Time</label>
                                <input type="text" name="readTime" value={formData.readTime} onChange={handleInputChange} required className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50' : 'border-black/[0.15] text-black focus:border-emerald-800/50'}`} placeholder="e.g. 5 min read" />
                              </div>
                            </div>

                            <div>
                              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Summary</label>
                              <textarea name="summary" value={formData.summary} onChange={handleInputChange} required rows={2} className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors resize-none ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50' : 'border-black/[0.15] text-black focus:border-emerald-800/50'}`} placeholder="Brief summary..." />
                            </div>

                            <div>
                              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Content Body</label>
                              <textarea name="content" value={formData.content} onChange={handleInputChange} required rows={10} className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-sans text-sm transition-colors resize-y ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50' : 'border-black/[0.15] text-black focus:border-emerald-800/50'}`} placeholder="Main article text. Use **text** for bold headings." />
                            </div>

                            <div>
                              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-2 ${tTextSub}`}>Tags</label>
                              <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className={`w-full px-4 py-3 bg-transparent border focus:outline-none font-mono text-sm transition-colors ${isDark ? 'border-white/[0.1] text-white focus:border-emerald-500/50' : 'border-black/[0.15] text-black focus:border-emerald-800/50'}`} placeholder="Tag1, Tag2, Tag3" />
                            </div>

                          </form>
                        </div>

                        <div className={`p-6 border-t flex flex-col md:flex-row gap-4 shrink-0 ${tBorder}`}>
                          <button type="submit" form="article-form" className={`flex-1 h-12 font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${isDark ? 'bg-emerald-500 text-[#020805] hover:bg-emerald-400' : 'bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700'}`}>
                            PUBLISH ASSET
                          </button>
                          <button type="button" onClick={() => setShowCreateForm(false)} className={`flex-1 h-12 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-white/[0.05] text-neutral-400 hover:text-white' : 'border-black/[0.08] text-neutral-600 hover:text-black'}`}>
                            ABORT
                          </button>
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