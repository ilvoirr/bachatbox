"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef, type KeyboardEvent, useCallback } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
import {
  IconChartBar,
  IconMessageCircle,
  IconReceipt,
  IconUsers,
  IconTable,
  IconSparkles,
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconNews,
  IconAlertTriangle,
  IconBook,
  IconShieldCheck,
  IconSearch,
  IconActivity,
  IconArrowUp,
  IconArrowDown,
  IconClock,
  IconRefresh,
  IconPlus,
  IconX,
  IconCheck,
  IconTrash
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
interface StockData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  marketCap?: string;
  name?: string;
  high52?: string;
  low52?: string;
  pe?: string;
  dividend?: string;
  beta?: string;
}

interface CompanyProfile {
  name: string;
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  shareOutstanding: number;
  logo: string;
  weburl: string;
  phone: string;
  finnhubIndustry: string;
}

interface MarketIndex {
  name: string;
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
}

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface PortfolioStock {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  totalValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
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

export default function StockMarketPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -------------------- Stock Market State --------------------
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [popularStocks, setPopularStocks] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<StockData[]>([]);
  const [topLosers, setTopLosers] = useState<StockData[]>([]);
  const [mostActive, setMostActive] = useState<StockData[]>([]);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    shares: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  // -------------------- Finnhub API Functions --------------------
  const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

  const fetchStockData = async (symbol: string): Promise<StockData | null> => {
    try {
      const [quoteResponse, profileResponse, metricsResponse] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`)
      ]);

      const quote = await quoteResponse.json();
      const profile = await profileResponse.json();
      const metrics = await metricsResponse.json();

      if (quote.c && quote.c > 0) {
        const change = quote.c - quote.pc;
        const changePercent = ((change / quote.pc) * 100);

        return {
          symbol: symbol,
          price: quote.c.toFixed(2),
          change: change.toFixed(2),
          changePercent: changePercent.toFixed(2),
          open: quote.o.toFixed(2),
          high: quote.h.toFixed(2),
          low: quote.l.toFixed(2),
          volume: quote.t ? quote.t.toLocaleString() : 'N/A',
          name: profile.name || symbol,
          high52: metrics?.metric?.['52WeekHigh']?.toFixed(2) || 'N/A',
          low52: metrics?.metric?.['52WeekLow']?.toFixed(2) || 'N/A',
          pe: metrics?.metric?.peBasicExclExtraTTM?.toFixed(2) || 'N/A',
          dividend: metrics?.metric?.currentDividendYieldTTM?.toFixed(2) || '0.00',
          beta: metrics?.metric?.beta?.toFixed(2) || 'N/A',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return null;
    }
  };

  const fetchCompanyProfile = async (symbol: string): Promise<CompanyProfile | null> => {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`);
      const data = await response.json();
      return data.name ? data : null;
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return null;
    }
  };

  const fetchMarketIndices = async () => {
    const indices = [
      { name: 'S&P 500', symbol: '^GSPC' },
      { name: 'NASDAQ', symbol: '^IXIC' },
      { name: 'Dow Jones', symbol: '^DJI' }
    ];
    const indexPromises = indices.map(async (index) => {
      const data = await fetchStockData(index.symbol);
      return data ? { name: index.name, symbol: index.symbol, price: data.price, change: data.change, changePercent: data.changePercent } : null;
    });
    const results = await Promise.all(indexPromises);
    setMarketIndices(results.filter(index => index !== null) as MarketIndex[]);
  };

  const fetchMarketMovers = async () => {
    try {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 'AMD', 'CRM', 'UBER', 'PYPL', 'ADBE', 'INTC', 'CSCO'];
      const stockPromises = symbols.map(symbol => fetchStockData(symbol));
      const results = await Promise.all(stockPromises);
      const validStocks = results.filter(stock => stock !== null) as StockData[];

      const sortedByGain = [...validStocks].sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent));
      const sortedByLoss = [...validStocks].sort((a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent));
      const sortedByVolume = [...validStocks].sort((a, b) => {
        const aVol = parseInt(a.volume.replace(/,/g, '')) || 0;
        const bVol = parseInt(b.volume.replace(/,/g, '')) || 0;
        return bVol - aVol;
      });

      setTopGainers(sortedByGain.slice(0, 6));
      setTopLosers(sortedByLoss.slice(0, 6));
      setMostActive(sortedByVolume.slice(0, 6));
    } catch (error) {
      console.error('Error fetching market movers:', error);
    }
  };

  const fetchMarketNews = async () => {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`);
      const data = await response.json();
      setMarketNews(data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const searchStock = async () => {
    if (!searchSymbol.trim()) return;
    setSearchLoading(true);
    const stockData = await fetchStockData(searchSymbol.toUpperCase());
    if (stockData) {
      setSelectedStock(stockData);
      const companyData = await fetchCompanyProfile(searchSymbol.toUpperCase());
      setSelectedCompany(companyData);
    } else {
      alert('Stock not found! Try symbols like AAPL, GOOGL, MSFT, TSLA');
    }
    setSearchLoading(false);
  };

  const loadPopularStocks = async () => {
    setLoading(true);
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
    const stockPromises = symbols.map(symbol => fetchStockData(symbol));
    const results = await Promise.all(stockPromises);
    setPopularStocks(results.filter(stock => stock !== null) as StockData[]);
    setLoading(false);
  };

  const addToPortfolio = async () => {
    if (!newStock.symbol || !newStock.shares) {
      alert('Please enter stock symbol and number of shares');
      return;
    }
    const stockData = await fetchStockData(newStock.symbol.toUpperCase());
    if (!stockData) {
      alert('Stock not found!');
      return;
    }

    const purchasePrice = parseFloat(stockData.price);
    const portfolioStock: PortfolioStock = {
      symbol: newStock.symbol.toUpperCase(),
      name: stockData.name || newStock.symbol.toUpperCase(),
      shares: parseFloat(newStock.shares),
      purchasePrice: purchasePrice,
      purchaseDate: newStock.purchaseDate,
      currentPrice: purchasePrice,
      totalValue: parseFloat(newStock.shares) * purchasePrice,
      gainLoss: 0,
      gainLossPercent: 0
    };

    const newPortfolio = [...portfolio, portfolioStock];
    setPortfolio(newPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(newPortfolio));
    
    setNewStock({ symbol: '', shares: '', purchaseDate: new Date().toISOString().split('T')[0] });
    setShowAddStock(false);
  };

  const removeFromPortfolio = (index: number) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    setPortfolio(newPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(newPortfolio));
  };

  const updatePortfolioPrices = async () => {
    if (portfolio.length === 0) return;
    const updatedPortfolio = await Promise.all(
      portfolio.map(async (stock) => {
        const stockData = await fetchStockData(stock.symbol);
        if (stockData) {
          const currentPrice = parseFloat(stockData.price);
          return {
            ...stock, currentPrice,
            totalValue: stock.shares * currentPrice,
            gainLoss: (currentPrice - stock.purchasePrice) * stock.shares,
            gainLossPercent: ((currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100
          };
        }
        return stock;
      })
    );
    setPortfolio(updatedPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
  };

  useEffect(() => {
    if (API_KEY) {
      loadPopularStocks();
      fetchMarketIndices();
      fetchMarketMovers();
      fetchMarketNews();
    }
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
  }, [API_KEY]);

  useEffect(() => {
    const interval = setInterval(() => { updatePortfolioPrices(); }, 300000);
    return () => clearInterval(interval);
  }, [portfolio]);

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

  const getChangeColor = (change: string | number) => {
    const val = typeof change === 'string' ? parseFloat(change) : change;
    return val >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-rose-400' : 'text-rose-700');
  };

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
                        <SidebarLink link={link} className={`transition-colors font-mono text-[10px] tracking-[0.15em] uppercase ${isDark ? 'text-neutral-400 group-hover:text-emerald-300' : 'text-neutral-500 group-hover:text-emerald-800'}`} />
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
          <div className={cn("transition-all duration-300 ease-in-out flex-1 flex flex-col relative z-10 min-h-screen", sidebarOpen ? "ml-64" : "ml-16")}>
            
            {/* Sticky Glassmorphic Topbar */}
            <header className={`sticky top-0 z-30 flex items-center justify-between h-20 px-8 md:px-12 backdrop-blur-md border-b transition-colors duration-500 ${isDark ? 'bg-[#020805]/80 border-white/[0.03]' : 'bg-[#F7F6F2]/80 border-black/[0.05]'}`}>
              <div className={`ml-4 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase transition-colors duration-500 ${isDark ? 'text-emerald-500/70' : 'text-emerald-800/70'}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDark ? 'bg-emerald-500' : 'bg-emerald-700'}`}></span>
                </span>
                Global Equities Hub
              </div>
              
              <div className="flex items-center gap-6">
                <button onClick={() => setIsDark(!isDark)} className="relative group w-6 h-6 flex items-center justify-center focus:outline-none">
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
            <main className="flex-1 p-6 md:p-8">
              <div className="max-w-6xl mx-auto space-y-10 pb-12">

                {/* Header & Search */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b transition-colors duration-500 ${tBorder}`}>
                  <div>
                    <p className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-4 transition-colors duration-500 ${isDark ? 'text-emerald-400/60' : 'text-emerald-800/60'}`}>
                      Market Intelligence
                    </p>
                    <h1 className={`${libreBaskerville.className} text-4xl md:text-5xl tracking-tighter mix-blend-normal`}>
                      Equities <span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Tracker.</span>
                    </h1>
                  </div>

                  <div className={`flex w-full md:max-w-md border transition-colors duration-500 h-12 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                    <input
                      type="text"
                      placeholder="ENTER SYMBOL (e.g., AAPL)"
                      value={searchSymbol}
                      onChange={(e) => setSearchSymbol(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchStock()}
                      className={`flex-1 bg-transparent px-6 font-mono text-[10px] uppercase tracking-widest focus:outline-none transition-colors ${isDark ? 'text-white placeholder:text-neutral-700' : 'text-black placeholder:text-neutral-400'}`}
                    />
                    <button
                      onClick={searchStock}
                      disabled={searchLoading || !API_KEY}
                      className={`px-6 border-l text-[10px] font-mono uppercase tracking-[0.15em] font-bold transition-all flex items-center gap-2 ${tBorder} ${isDark ? 'bg-white text-[#020805] hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'} disabled:opacity-50`}
                    >
                      {searchLoading ? <IconActivity className="w-3.5 h-3.5 animate-pulse" /> : <IconSearch className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">SEARCH</span>
                    </button>
                  </div>
                </div>

                {/* Selected Stock Display */}
                <AnimatePresence>
                  {selectedStock && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`border p-8 transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                      <div className={`flex flex-col md:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b ${tBorder}`}>
                        <div className="flex items-center gap-6">
                          {selectedCompany?.logo && (
                            <div className={`p-2 border ${isDark ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-black/[0.02] border-black/[0.1]'}`}>
                              <img src={selectedCompany.logo} alt={`${selectedStock.symbol} logo`} className="w-12 h-12 object-contain" />
                            </div>
                          )}
                          <div>
                            <h2 className={`${libreBaskerville.className} text-4xl md:text-5xl ${tTextMain}`}>{selectedStock.symbol}</h2>
                            <p className={`font-mono text-xs uppercase tracking-widest mt-2 ${tTextSub}`}>
                              {selectedCompany?.name || selectedStock.name || 'Real-time Stock Price'}
                            </p>
                            {selectedCompany && (
                              <p className={`font-mono text-[9px] uppercase tracking-[0.2em] mt-2 opacity-50 ${tTextSub}`}>
                                {selectedCompany.exchange} • {selectedCompany.country}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="md:text-right">
                          <div className={`${libreBaskerville.className} text-5xl md:text-6xl tracking-tighter ${tTextMain}`}>
                            ${selectedStock.price}
                          </div>
                          <div className={`font-mono text-xs uppercase tracking-widest mt-2 flex items-center md:justify-end gap-2 ${getChangeColor(selectedStock.change)}`}>
                            {parseFloat(selectedStock.change) >= 0 ? <IconArrowUp className="w-4 h-4" /> : <IconArrowDown className="w-4 h-4" />}
                            <span>{selectedStock.change} ({selectedStock.changePercent}%)</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                        {[
                          { l: 'Open', v: `$${selectedStock.open}` },
                          { l: 'High', v: `$${selectedStock.high}` },
                          { l: 'Low', v: `$${selectedStock.low}` },
                          { l: 'Volume', v: selectedStock.volume },
                          { l: '52W High', v: `$${selectedStock.high52}` },
                          { l: '52W Low', v: `$${selectedStock.low52}` },
                          { l: 'P/E Ratio', v: selectedStock.pe },
                          { l: 'Market Cap', v: selectedCompany?.marketCapitalization ? `$${(selectedCompany.marketCapitalization / 1000).toFixed(2)}B` : 'N/A' },
                        ].map((stat, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${tTextSub}`}>{stat.l}</span>
                            <span className={`font-mono text-sm tracking-widest ${tTextMain}`}>{stat.v}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Tabs */}
                <div className={`flex gap-6 border-b overflow-x-auto no-scrollbar ${tBorder}`}>
                  {[
                    { id: 'overview', label: 'Market Overview', icon: IconActivity },
                    { id: 'portfolio', label: 'My Portfolio', icon: IconWallet },
                    { id: 'news', label: 'Intel Feed', icon: IconNews }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${
                        activeTab === tab.id 
                          ? (isDark ? 'border-b-2 border-emerald-400 text-emerald-400' : 'border-b-2 border-emerald-800 text-emerald-800') 
                          : `${tTextSub} hover:${tTextMain}`
                      }`}
                    >
                      <tab.icon className="w-4 h-4" stroke={1.5} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                  
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                      
                      {/* Market Indices */}
                      {marketIndices.length > 0 && (
                        <div>
                          <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${tTextSub}`}>
                            <div className="w-1.5 h-1.5 bg-current opacity-50" /> Core Indices
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {marketIndices.map((index) => (
                              <div key={index.symbol} className={`border p-6 flex flex-col justify-between transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className={`font-mono text-sm tracking-widest uppercase ${tTextMain}`}>{index.name}</h4>
                                    <p className={`text-[9px] font-mono tracking-[0.2em] mt-1 ${tTextSub}`}>{index.symbol}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className={`font-mono text-lg ${tTextMain}`}>{index.price}</div>
                                    <div className={`text-[10px] font-mono tracking-widest mt-1 ${getChangeColor(index.change)}`}>
                                      {parseFloat(index.change) > 0 ? '+' : ''}{index.change} ({index.changePercent}%)
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Popular Stocks Grid */}
                      <div>
                        <div className="flex justify-between items-end mb-4">
                          <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 ${tTextSub}`}>
                            <div className="w-1.5 h-1.5 bg-current opacity-50" /> High-Volume Equities
                          </h3>
                          <button onClick={loadPopularStocks} disabled={loading} className={`flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest transition-colors ${tTextSub} hover:${tTextMain}`}>
                            <IconRefresh className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> REFRESH
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {popularStocks.map((stock) => (
                            <motion.div
                              key={stock.symbol}
                              className={`border p-5 cursor-pointer transition-all duration-300 ${tBorder} hover:border-emerald-500/30 ${isDark ? 'bg-white/[0.01] hover:bg-white/[0.03]' : 'bg-black/[0.01] hover:bg-black/[0.03]'}`}
                              onClick={() => { setSelectedStock(stock); fetchCompanyProfile(stock.symbol).then(setSelectedCompany); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <h3 className={`${libreBaskerville.className} text-xl ${tTextMain}`}>{stock.symbol}</h3>
                                {parseFloat(stock.change) >= 0 ? <IconTrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} stroke={1.5}/> : <IconTrendingDown className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-700'}`} stroke={1.5}/>}
                              </div>
                              <div className={`font-mono text-xl tracking-tight mb-2 ${tTextMain}`}>${stock.price}</div>
                              <div className={`font-mono text-[10px] tracking-widest ${getChangeColor(stock.change)}`}>
                                {parseFloat(stock.change) > 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Movers */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[
                          { title: "Top Gainers", icon: IconTrendingUp, data: topGainers, isGain: true },
                          { title: "Top Losers", icon: IconTrendingDown, data: topLosers, isGain: false },
                          { title: "Most Active", icon: IconActivity, data: mostActive, isActive: true },
                        ].map((sect, i) => (
                          <div key={i} className={`border p-6 transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                            <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${tTextSub}`}>
                              <sect.icon className="w-3.5 h-3.5" stroke={1.5}/> {sect.title}
                            </h3>
                            <div className="space-y-4">
                              {sect.data.slice(0,5).map(stock => (
                                <div key={stock.symbol} className={`flex justify-between items-center cursor-pointer transition-colors group ${tTextMain} hover:${isDark?'text-emerald-300':'text-emerald-800'}`} onClick={() => setSelectedStock(stock)}>
                                  <div className="flex flex-col gap-1">
                                    <span className="font-mono text-sm tracking-widest">{stock.symbol}</span>
                                    <span className={`text-[9px] font-mono tracking-widest opacity-60 ${tTextSub}`}>${stock.price}</span>
                                  </div>
                                  <div className="text-right flex flex-col gap-1">
                                    {sect.isActive ? (
                                      <>
                                        <span className="font-mono text-xs tracking-widest">VOL</span>
                                        <span className={`text-[9px] font-mono tracking-widest ${tTextSub}`}>{stock.volume}</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className={`font-mono text-xs tracking-widest ${sect.isGain ? (isDark?'text-emerald-400':'text-emerald-700') : (isDark?'text-rose-400':'text-rose-700')}`}>
                                          {sect.isGain ? '+' : ''}{stock.changePercent}%
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* PORTFOLIO TAB */}
                  {activeTab === 'portfolio' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      
                      <div className="flex justify-between items-end">
                        <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 ${tTextSub}`}>
                          <div className="w-1.5 h-1.5 bg-current opacity-50" /> Asset Allocation
                        </h3>
                        <div className="flex gap-4">
                          <button onClick={updatePortfolioPrices} className={`flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest transition-colors ${tTextSub} hover:${tTextMain}`}>
                            <IconRefresh className="w-3 h-3" /> REFRESH PRICES
                          </button>
                          <button onClick={() => setShowAddStock(!showAddStock)} className={`flex items-center gap-2 h-8 px-4 border text-[9px] font-mono uppercase tracking-widest transition-colors ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30' : 'border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/10'}`}>
                            <IconPlus className="w-3 h-3" /> REGISTER ASSET
                          </button>
                        </div>
                      </div>

                      {/* Add Form */}
                      <AnimatePresence>
                        {showAddStock && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`border p-6 overflow-hidden ${tBorder} ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <input type="text" placeholder="SYMBOL" value={newStock.symbol} onChange={(e) => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})} className={`px-4 py-3 bg-transparent border font-mono text-[10px] tracking-widest focus:outline-none transition-colors ${tBorder} ${tTextMain} placeholder:text-neutral-600 focus:${isDark?'border-emerald-500/50':'border-emerald-800/50'}`} />
                              <input type="number" placeholder="SHARES" value={newStock.shares} onChange={(e) => setNewStock({...newStock, shares: e.target.value})} className={`px-4 py-3 bg-transparent border font-mono text-[10px] tracking-widest focus:outline-none transition-colors ${tBorder} ${tTextMain} placeholder:text-neutral-600 focus:${isDark?'border-emerald-500/50':'border-emerald-800/50'}`} />
                              <input type="date" value={newStock.purchaseDate} onChange={(e) => setNewStock({...newStock, purchaseDate: e.target.value})} className={`px-4 py-3 bg-transparent border font-mono text-[10px] tracking-widest focus:outline-none transition-colors ${tBorder} ${tTextMain} focus:${isDark?'border-emerald-500/50':'border-emerald-800/50'}`} />
                              <div className="flex gap-2 h-[42px] md:h-auto">
                                <button onClick={addToPortfolio} className={`flex-1 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest font-bold transition-colors ${isDark ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-emerald-800 text-white hover:bg-emerald-700'}`}>
                                  COMMIT
                                </button>
                                <button onClick={() => setShowAddStock(false)} className={`px-4 flex items-center justify-center border transition-colors ${tBorder} ${tTextSub} hover:${tTextMain}`}>
                                  <IconX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Summary */}
                      {portfolio.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {[
                            { l: 'Total Valuation', v: `$${portfolio.reduce((sum, s) => sum + (s.totalValue || 0), 0).toFixed(2)}`, c: tTextMain },
                            { l: 'Initial Capital', v: `$${portfolio.reduce((sum, s) => sum + (s.shares * s.purchasePrice), 0).toFixed(2)}`, c: tTextSub },
                            { l: 'Net P/L', v: `$${portfolio.reduce((sum, s) => sum + (s.gainLoss || 0), 0).toFixed(2)}`, c: portfolio.reduce((sum, s) => sum + (s.gainLoss || 0), 0) >= 0 ? (isDark?'text-emerald-400':'text-emerald-700') : (isDark?'text-rose-400':'text-rose-700') },
                            { l: 'Active Assets', v: portfolio.length, c: tTextMain },
                          ].map((stat, i) => (
                            <div key={i} className={`border p-5 flex flex-col justify-between gap-4 transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                              <span className={`text-[9px] font-mono uppercase tracking-[0.2em] ${tTextSub}`}>{stat.l}</span>
                              <span className={`font-mono text-xl tracking-tight ${stat.c}`}>{stat.v}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Table */}
                      {portfolio.length > 0 ? (
                        <div className={`border overflow-x-auto transition-colors duration-500 ${tBorder}`}>
                          <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                              <tr className={`border-b ${tBorder} ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
                                {['Asset', 'Shares', 'Entry', 'Current', 'Valuation', 'P/L', 'Return', 'Date', ''].map(h => (
                                  <th key={h} className={`px-6 py-4 text-[9px] font-mono uppercase tracking-[0.2em] ${tTextSub}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className={`divide-y transition-colors duration-500 ${isDark ? 'divide-white/[0.05]' : 'divide-black/[0.08]'}`}>
                              {portfolio.map((stock, i) => (
                                <tr key={i} className={`transition-colors duration-300 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-black/[0.02]'}`}>
                                  <td className={`px-6 py-4 font-mono text-xs tracking-widest ${tTextMain}`}>{stock.symbol}</td>
                                  <td className={`px-6 py-4 font-mono text-xs ${tTextSub}`}>{stock.shares}</td>
                                  <td className={`px-6 py-4 font-mono text-xs ${tTextSub}`}>${stock.purchasePrice.toFixed(2)}</td>
                                  <td className={`px-6 py-4 font-mono text-xs ${tTextMain}`}>${stock.currentPrice?.toFixed(2) || '-'}</td>
                                  <td className={`px-6 py-4 font-mono text-xs ${tTextMain}`}>${stock.totalValue?.toFixed(2) || '-'}</td>
                                  <td className={`px-6 py-4 font-mono text-xs ${getChangeColor(stock.gainLoss || 0)}`}>${stock.gainLoss?.toFixed(2) || '-'}</td>
                                  <td className={`px-6 py-4 font-mono text-xs ${getChangeColor(stock.gainLossPercent || 0)}`}>{stock.gainLossPercent?.toFixed(2) || '-'}%</td>
                                  <td className={`px-6 py-4 font-mono text-[10px] tracking-widest ${tTextSub}`}>{stock.purchaseDate}</td>
                                  <td className="px-6 py-4 text-right">
                                    <button onClick={() => removeFromPortfolio(i)} className={`transition-colors opacity-50 hover:opacity-100 ${isDark?'hover:text-rose-400':'hover:text-rose-700'}`}>
                                      <IconTrash className="w-4 h-4" stroke={1.5} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className={`py-20 text-center border transition-colors duration-500 ${tBorder} ${isDark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                          <IconWallet className={`w-8 h-8 mx-auto mb-4 opacity-50 ${tTextSub}`} stroke={1.2} />
                          <p className={`font-mono text-[10px] uppercase tracking-[0.2em] mb-6 ${tTextMain}`}>Ledger Empty</p>
                          <button onClick={() => setShowAddStock(true)} className={`h-10 px-8 border text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30' : 'border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/10'}`}>
                            INITIALIZE ASSET
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                  {/* NEWS TAB */}
                  {activeTab === 'news' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="flex justify-between items-end">
                        <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 ${tTextSub}`}>
                          <div className="w-1.5 h-1.5 bg-current opacity-50" /> Global Intel Feed
                        </h3>
                        <button onClick={fetchMarketNews} className={`flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest transition-colors ${tTextSub} hover:${tTextMain}`}>
                          <IconRefresh className="w-3 h-3" /> SYNC FEED
                        </button>
                      </div>

                      {marketNews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {marketNews.map((news) => (
                            <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className={`group flex flex-col border p-6 transition-all duration-300 ${tBorder} ${isDark ? 'bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20' : 'bg-black/[0.01] hover:bg-black/[0.03] hover:border-black/20'}`}>
                              <div className="flex items-center gap-4 mb-4">
                                <span className={`px-2 py-1 text-[8px] font-mono uppercase tracking-widest border ${isDark ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' : 'border-emerald-800/30 text-emerald-800 bg-emerald-800/10'}`}>
                                  {news.category}
                                </span>
                                <span className={`text-[9px] font-mono tracking-widest uppercase ${tTextSub}`}>
                                  {new Date(news.datetime * 1000).toLocaleDateString()} • {news.source}
                                </span>
                              </div>
                              <h4 className={`${libreBaskerville.className} text-xl mb-4 line-clamp-2 ${tTextMain} transition-colors group-hover:${isDark?'text-emerald-300':'text-emerald-800'}`}>
                                {news.headline}
                              </h4>
                              <p className={`font-mono text-[10px] leading-relaxed line-clamp-3 mb-6 flex-1 ${tTextSub}`}>
                                {news.summary}
                              </p>
                              <div className={`mt-auto text-[9px] font-mono uppercase tracking-[0.2em] ${tTextMain}`}>
                                READ DECRYPT →
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className={`py-20 text-center border transition-colors duration-500 ${tBorder}`}>
                          <IconNews className={`w-8 h-8 mx-auto mb-4 opacity-50 ${tTextSub}`} stroke={1.2} />
                          <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${tTextSub}`}>Intel Feed Offline</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* API Key Warning */}
                {!API_KEY && (
                  <div className={`mt-10 border border-yellow-500/30 p-8 flex flex-col items-center text-center ${isDark ? 'bg-yellow-500/5' : 'bg-yellow-600/5'}`}>
                    <IconAlertTriangle className={`w-8 h-8 mb-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} stroke={1.2} />
                    <h3 className={`font-mono text-[10px] uppercase tracking-[0.2em] mb-4 ${tTextMain}`}>Authorization Required</h3>
                    <p className={`font-mono text-xs leading-relaxed max-w-lg mb-6 ${tTextSub}`}>
                      Finnhub API telemetry key is missing. Deploy <span className={tTextMain}>NEXT_PUBLIC_FINNHUB_API_KEY</span> to environment configuration to restore live data sync.
                    </p>
                  </div>
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