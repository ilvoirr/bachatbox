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
  IconBook,
  IconSparkles,
  IconPlus,
  IconX,
  IconChevronUp,
  IconTrendingUp,IconShieldCheck
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';


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


// Type definitions
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


// Financial Reads Component
const FinancialReadsContent = () => {
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [articles, setArticles] = useState<FinancialArticle[]>([]);
  const { user } = useUser();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    readTime: '',
    summary: '',
    content: '',
    tags: ''
  });

  // Load articles from localStorage on component mount
  useEffect(() => {
    const savedArticles = localStorage.getItem('financialArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      // Initialize with default articles
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


The general recommendation suggests maintaining three to six months of living expenses in your emergency fund. However, this range isn't arbitrary. The appropriate amount depends on several personal factors including job security, health status, number of dependents, and overall financial stability. Someone with a stable government job might feel comfortable with three months of expenses, while a freelancer or commission-based worker might prefer six months or more.


Calculating your emergency fund target requires honest assessment of your essential monthly expenses. Include housing costs like rent or mortgage payments, utilities, groceries, insurance premiums, minimum debt payments, and transportation costs. Don't include discretionary spending like entertainment, dining out, or hobby expenses, as these can be eliminated during an emergency.


Building an emergency fund from scratch can feel overwhelming, especially when living paycheck to paycheck. The key lies in starting small and building momentum. Begin with a micro-goal of saving just $500. This amount can cover many minor emergencies like a small car repair or medical co-pay. Once you reach this milestone, gradually increase your target.


Automation makes emergency fund building virtually effortless. Set up an automatic transfer from your checking account to a dedicated savings account immediately after each paycheck arrives. Even if you can only afford $25 per week, you'll accumulate $1,300 over the course of a year. Many people find they don't even miss small automatic transfers.


The location of your emergency fund matters significantly. You want your money easily accessible during genuine emergencies, but not so accessible that you're tempted to dip into it for non-emergencies. A high-yield savings account offers the perfect balance, providing better interest rates than traditional savings accounts while maintaining liquidity.


Avoid investing your emergency fund in stocks, bonds, or other volatile investments. The purpose of this money is security and accessibility, not growth. You never know when you might need these funds, and market downturns often coincide with economic conditions that increase the likelihood of job loss or other financial emergencies.


One common mistake involves using emergency funds for predictable expenses that should be budgeted separately. Car maintenance, holiday gifts, and annual insurance premiums aren't emergencies if you know they're coming. Create separate sinking funds for these predictable irregular expenses.


As your financial situation improves, reassess your emergency fund needs. A promotion, marriage, new baby, or home purchase might necessitate adjusting your emergency fund target. Similarly, paying off debt or achieving greater job security might allow you to maintain a smaller emergency fund.


Remember that building an emergency fund is a marathon, not a sprint. Focus on consistency rather than speed. Every dollar you save brings you closer to financial security and peace of mind. The goal isn't perfection but progress toward greater financial resilience.
`,
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


Understanding the distinction between needs and wants forms the foundation of successful 50/30/20 budgeting. Needs represent expenses absolutely essential for survival and basic functioning in society. These include housing costs like rent or mortgage payments, utilities such as electricity and water, groceries for basic nutrition, transportation to work, insurance premiums, and minimum debt payments.


The needs category can be tricky because modern life has blurred the lines between necessities and conveniences. For example, internet service might feel essential for work and communication, making it a legitimate need for many people. However, the premium cable package with hundreds of channels clearly falls into the wants category.


Housing typically represents the largest portion of the needs category. Financial experts generally recommend keeping housing costs below 30% of gross income, but in high-cost areas, this percentage often creeps higher. If your housing costs exceed this threshold, you might need to adjust other categories or consider whether your current living situation aligns with your financial goals.


Transportation costs vary dramatically based on location and lifestyle choices. Urban dwellers might rely on public transit, rideshare services, or even walking and cycling. Suburban and rural residents often require personal vehicles, bringing expenses like car payments, insurance, fuel, and maintenance into the needs category.


The wants category encompasses everything that enhances your quality of life but isn't strictly necessary for survival. This includes dining out, entertainment subscriptions, hobbies, gym memberships, personal care beyond basic necessities, and shopping for non-essential items. This category is where you get to enjoy the fruits of your labor and maintain social connections.


Many people struggle with the wants category because it requires honest self-reflection about spending habits. That daily coffee shop visit, frequent online shopping, or premium subscription services can quickly consume the entire 30% allocation. The key is making intentional choices about which wants truly bring you joy and value.


The savings and debt repayment category serves dual purposes in building financial security. This 20% should first address high-interest debt, particularly credit card balances that can compound rapidly. Once high-interest debt is eliminated, focus shifts to building an emergency fund, contributing to retirement accounts, and saving for other financial goals.


Implementing the 50/30/20 rule requires accurate tracking of your current spending patterns. Start by reviewing several months of bank and credit card statements to understand where your money actually goes. Many people discover significant surprises during this exercise, finding money flowing toward forgotten subscriptions or impulse purchases.


Technology can simplify budget tracking significantly. Numerous apps and online tools can categorize transactions automatically, though you'll need to review and adjust categories regularly. Some banks and credit unions offer built-in spending analysis tools that can jumpstart your budgeting efforts.


The 50/30/20 rule isn't universally applicable to every financial situation. High earners might find they can save more than 20% without sacrificing quality of life. Conversely, those with lower incomes might struggle to limit needs to 50% of income, especially in expensive metropolitan areas.


Geographic location significantly impacts the feasibility of the 50/30/20 rule. Someone earning $50,000 in a small Midwest town might find the allocation works perfectly, while the same income in San Francisco or New York City might make the 50% needs target unrealistic.


Life circumstances also influence budget allocation effectiveness. Young professionals might comfortably allocate 30% to wants as they build careers and social networks. Parents with young children might find needs consuming a larger percentage due to childcare costs and family-related expenses.


The beauty of the 50/30/20 rule lies in its flexibility and adaptability. Use it as a starting framework, then adjust percentages based on your unique circumstances and financial goals. The important thing is creating intentional spending decisions rather than wondering where your money disappeared each month.


Regular budget reviews ensure your allocation remains aligned with changing circumstances. A job change, move to a new city, marriage, divorce, or other major life events might necessitate adjusting your percentages. The rule should serve your financial goals, not constrain them unnecessarily.
`,
          tags: ["Budgeting", "Money Management", "Financial Planning"],
          upvotes: 12,
          author: "BachatBox Team",
          createdAt: "2025-09-02"
        },
        {
          id: 3,
          title: "Investment Basics for Beginners",
          category: "Investing",
          readTime: "7 min read",
          summary: "Understand the fundamentals of investing, from compound interest to diversification strategies.",
          content: `Investing represents one of the most powerful tools for building long-term wealth, yet many people avoid it due to perceived complexity or fear of losing money. The reality is that investing, while requiring some knowledge and patience, operates on relatively straightforward principles that anyone can learn and apply successfully.


The fundamental concept underlying all investing is putting your money to work to generate additional income or growth over time. Instead of letting cash sit in low-yield savings accounts where inflation gradually erodes purchasing power, investing allows your money to potentially grow faster than the rate of inflation, preserving and increasing your wealth over decades.


Compound interest serves as the engine that drives long-term investment success. Albert Einstein allegedly called compound interest the eighth wonder of the world, and for good reason. When you invest money and earn returns, those returns themselves begin earning returns in subsequent years. This compounding effect becomes increasingly powerful over longer time horizons.


Consider a simple example: investing $1,000 annually starting at age 25 in an account earning 7% annually. By age 65, you would have contributed $40,000 but accumulated approximately $213,000 due to compound growth. Starting just ten years later at age 35 with the same annual contributions would result in only about $95,000 by age 65, despite contributing $30,000. This dramatic difference illustrates why starting early, even with small amounts, can be more powerful than waiting to invest larger sums later.


Risk and return represent two sides of the same investment coin. Generally speaking, investments offering higher potential returns also carry higher risk of loss. Government bonds offer relatively low returns but high security, while stocks historically provide higher returns but with significantly more volatility. Understanding your personal risk tolerance and time horizon helps determine appropriate investment allocation.


Diversification reduces investment risk without necessarily reducing expected returns. Rather than putting all your money into a single stock or asset class, spreading investments across different companies, industries, and asset types helps protect against significant losses. When some investments perform poorly, others may perform well, smoothing overall portfolio performance.


Asset allocation refers to how you divide investments among different categories like stocks, bonds, and cash. Young investors with decades until retirement can typically accept more volatility in exchange for higher growth potential, leading to stock-heavy portfolios. Older investors nearing or in retirement often prefer more conservative allocations emphasizing bonds and dividend-paying stocks.


Individual stock selection requires significant research, time, and expertise that many beginning investors lack. Instead of trying to pick winning individual companies, index funds and exchange-traded funds (ETFs) offer instant diversification by owning hundreds or thousands of companies in a single investment.


Index funds track specific market indexes like the S&P 500, which represents 500 of the largest U.S. companies. When you buy an S&P 500 index fund, you effectively own tiny pieces of companies like Apple, Microsoft, Amazon, and hundreds of others. These funds offer broad market exposure with minimal fees and no need for extensive research.


Target-date funds provide even simpler investing for retirement accounts. These funds automatically adjust asset allocation based on your expected retirement date, becoming more conservative as you age. Someone planning to retire in 2055 might choose a Target Date 2055 fund, which would start with aggressive growth investments and gradually shift toward more conservative holdings over time.


Dollar-cost averaging represents a strategy of investing fixed amounts regularly regardless of market conditions. Instead of trying to time the market by guessing when prices are low, you invest the same amount monthly or quarterly. This approach naturally buys more shares when prices are low and fewer shares when prices are high, potentially improving long-term returns.


Tax-advantaged retirement accounts like 401(k)s and IRAs offer significant benefits for long-term investors. Traditional accounts provide immediate tax deductions but require paying taxes on withdrawals in retirement. Roth accounts use after-tax dollars but allow tax-free withdrawals in retirement. Many financial advisors recommend maxizing contributions to these accounts before investing in taxable accounts.


Employer 401(k) matching represents free money that every eligible worker should claim. If your employer matches 50% of contributions up to 6% of salary, contributing at least 6% gives you an immediate 50% return on that money. Few investments can guarantee such immediate returns, making 401(k) matching a top priority for beginning investors.


Investment fees can significantly impact long-term returns, making low-cost options crucial for success. A fund charging 1% annually might seem negligible, but over decades, high fees can cost tens of thousands of dollars compared to similar funds charging 0.1%. Always compare expense ratios when choosing between similar investment options.


Emotional discipline often determines investment success more than perfect strategy. Markets regularly experience volatility, with significant ups and downs that can trigger fear or greed. Successful investors develop the discipline to stick with their long-term plans rather than making impulsive decisions based on short-term market movements.


Beginning investors should start by educating themselves through reputable sources, taking advantage of employer retirement benefits, and beginning regular investing habits even with small amounts. The goal isn't perfect optimization but developing consistent saving and investing behaviors that compound over time into significant wealth.


Investment success requires patience, consistency, and realistic expectations. While the stock market has historically provided positive returns over long periods, short-term volatility is normal and expected. Focus on time in the market rather than timing the market, and remember that building wealth through investing is a marathon, not a sprint.
`,
          tags: ["Investing", "Compound Interest", "Index Funds"],
          upvotes: 8,
          author: "BachatBox Team",
          createdAt: "2025-09-03"
        },
        {
          id: 4,
          title: "Understanding Credit Scores and Reports",
          category: "Credit Management", 
          readTime: "6 min read",
          summary: "Learn how credit scores work, what affects them, and strategies to improve your creditworthiness.",
          content: `Your credit score functions as a financial report card that influences countless aspects of your economic life, from the interest rates you receive on loans to your ability to rent apartments or even secure certain jobs. Despite its importance, many people remain unclear about how credit scoring works, what factors influence their scores, and how to improve their creditworthiness over time.


Credit scores represent numerical summaries of your credit history, typically ranging from 300 to 850. These three-digit numbers attempt to predict the likelihood that you'll repay borrowed money as agreed. Lenders use credit scores to make quick decisions about loan approvals and interest rates, with higher scores generally resulting in better borrowing terms.


The most widely used credit scoring model comes from FICO, though VantageScore has gained popularity in recent years. While the specific calculations remain proprietary, both models consider similar factors when determining your score. Understanding these factors helps you make informed decisions about credit management and improvement strategies.


Payment history carries the most weight in credit score calculations, typically accounting for about 35% of your FICO score. This factor examines whether you've made payments on time for credit cards, loans, mortgages, and other credit accounts. Even one late payment can negatively impact your score, while consistent on-time payments build positive credit history over time.


The severity and recency of late payments influence their impact on your credit score. A payment 30 days late has less impact than one 60 or 90 days late. Similarly, recent late payments hurt your score more than older ones. Accounts sent to collections, bankruptcies, and foreclosures represent severe negative marks that can significantly damage credit scores for years.


Credit utilization, representing about 30% of your FICO score, measures how much of your available credit you're actually using. If you have credit cards with combined limits of $10,000 and current balances totaling $3,000, your utilization ratio is 30%. Lower utilization ratios generally result in higher credit scores, with most experts recommending keeping total utilization below 30% and ideally below 10%.


Both overall utilization across all accounts and individual account utilization matter for credit scoring. Maxing out even one credit card can hurt your score, even if your overall utilization remains low. This is why spreading balances across multiple cards or paying down individual cards completely can be beneficial for credit scores.


Length of credit history contributes approximately 15% to your FICO score and considers both the age of your oldest account and the average age of all accounts. This factor rewards consumers who have maintained credit accounts for extended periods, demonstrating long-term financial responsibility. Closing old credit cards can potentially hurt your score by reducing the average age of accounts.


Credit mix accounts for about 10% of your FICO score and examines the variety of credit accounts you manage. Having experience with different types of credit, such as credit cards, auto loans, mortgages, and student loans, can positively influence your score. However, you shouldn't take on unnecessary debt just to improve credit mix.


New credit inquiries represent the final 10% of your FICO score calculation. When you apply for new credit, lenders typically request your credit report, creating a "hard inquiry" that can temporarily lower your score by a few points. Multiple inquiries for the same type of loan within a short period are often treated as a single inquiry, recognizing that consumers often shop around for the best rates.


Credit reports contain the detailed information used to calculate credit scores. These reports include personal information like your name and address, account histories showing payment patterns and balances, public records such as bankruptcies or tax liens, and inquiries from companies that have requested your credit information.


The three major credit reporting agencies, Equifax, Experian, and TransUnion, maintain separate credit reports that may contain slightly different information. Lenders don't always report to all three agencies, and errors can appear on one report but not others. This is why checking all three reports regularly is important for comprehensive credit monitoring.


Federal law entitles you to one free credit report annually from each agency through annualcreditreport.com. Many experts recommend staggering these requests throughout the year, checking one report every four months to monitor for changes or errors. Numerous websites and apps also provide free credit score monitoring, though these may use different scoring models than lenders.


Credit report errors are surprisingly common and can negatively impact your credit scores. These might include accounts that don't belong to you, incorrect payment histories, outdated information that should have been removed, or personal information errors. Disputing errors with credit reporting agencies can result in improvements to your credit scores once corrections are made.


Building credit from scratch requires patience and strategic planning. Young adults or immigrants without credit history might start with secured credit cards, which require cash deposits that serve as credit limits. Student credit cards, becoming an authorized user on someone else's account, or credit-builder loans can also help establish initial credit history.


Improving damaged credit requires consistent effort over time. Start by ensuring all current accounts are paid on time going forward, as positive payment history will gradually outweigh negative marks. Pay down credit card balances to improve utilization ratios, and avoid closing old accounts unless they carry annual fees that outweigh their credit history benefits.


Credit scores influence more than just loan approvals and interest rates. Landlords often check credit when evaluating rental applications. Insurance companies may use credit information when setting premiums. Some employers review credit reports as part of background checks, particularly for positions involving financial responsibilities.


Understanding credit scores and reports empowers you to make informed financial decisions and take control of your creditworthiness. Regular monitoring, responsible credit management, and patience with the improvement process can help you achieve and maintain strong credit scores that open doors to better financial opportunities throughout your life.
`,
          tags: ["Credit Score", "Credit Report", "Financial Health"],
          upvotes: 6,
          author: "BachatBox Team",
          createdAt: "2025-09-04"
        }
      ];
      setArticles(defaultArticles);
      localStorage.setItem('financialArticles', JSON.stringify(defaultArticles));
    }
  }, []);

  // Save articles to localStorage whenever articles change
  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('financialArticles', JSON.stringify(articles));
    }
  }, [articles]);

  // Sort articles by upvotes (descending)
  const sortedArticles = [...articles].sort((a, b) => b.upvotes - a.upvotes);

  const toggleExpanded = (id: number) => {
    setIsExpanded((prev: ExpandedState) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpvote = (id: number) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === id 
          ? { ...article, upvotes: article.upvotes + 1 }
          : article
      )
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newArticle: FinancialArticle = {
      id: Date.now(), // Simple ID generation
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

    setArticles(prevArticles => [newArticle, ...prevArticles]);
    
    // Reset form
    setFormData({
      title: '',
      category: '',
      readTime: '',
      summary: '',
      content: '',
      tags: ''
    });
    
    setShowCreateForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="px-8 py-6">
      {/* Header Section */}
      <div className="mb-8 ml-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            
            <h1 className="text-3xl font-bold text-gray-900">Financial Education Hub</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-white text-black px-4 py-2 rounded-lg font-medium transition-colors duration-200 border-t"
          >
            <IconPlus className="h-5 w-5" />
            Create Article
          </button>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Master your money with these essential financial literacy articles. Build better financial habits, one read at a time.
        </p>
      </div>

      {/* Create Article Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Article</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter article title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="Personal Finance Basics">Personal Finance Basics</option>
                      <option value="Budgeting">Budgeting</option>
                      <option value="Investing">Investing</option>
                      <option value="Credit Management">Credit Management</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Tax Planning">Tax Planning</option>
                      <option value="Retirement Planning">Retirement Planning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                    <input
                      type="text"
                      name="readTime"
                      value={formData.readTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 5 min read"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                    placeholder="Brief summary of the article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                    placeholder="Full article content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter tags separated by commas (e.g., Budgeting, Savings, Tips)"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                  >
                    Create Article
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-6 ml-4">
        {sortedArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
            <div className="p-6">
              {/* Article Header */}
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-500">by {article.author}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{article.readTime}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpvote(article.id)}
                      className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full transition-colors duration-200 border border-green-200"
                    >
                      <IconChevronUp className="h-4 w-4" />
                      <span className="text-sm font-medium">{article.upvotes}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Title and Summary */}
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {article.title}
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {article.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleExpanded(article.id)}
                className="inline-flex items-center text-green-600 hover:text-green-800 font-medium transition-colors duration-200"
              >
                {isExpanded[article.id] ? 'Read Less' : 'Read More'}
                <svg
                  className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                    isExpanded[article.id] ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Content */}
              {isExpanded[article.id] && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="prose prose-gray max-w-none">
                    {article.content.split('\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') return null;
                      
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                            {paragraph.replace(/\*\*/g, '')}
                          </h3>
                        );
                      }
                      
                      if (paragraph.trim().match(/^\d+\./)) {
                        return (
                          <p key={index} className="ml-4 mb-2 text-gray-700">
                            {paragraph.trim()}
                          </p>
                        );
                      }
                      
                      if (paragraph.trim().startsWith('-')) {
                        return (
                          <p key={index} className="ml-4 mb-1 text-gray-700">
                            {paragraph.trim()}
                          </p>
                        );
                      }
                      
                      return (
                        <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function FinancialReadsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);


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


            {/* Page Content */}
            <div className="min-h-[calc(100vh-9.5vh)] bg-[#ecf8e5]">
              <FinancialReadsContent />
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
