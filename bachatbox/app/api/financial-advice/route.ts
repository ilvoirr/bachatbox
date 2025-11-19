import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const { transactions, budget } = await req.json();

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        advice: {
          healthScore: 0,
          healthStatus: "No data yet",
          topSpending: "Add some transactions so I can see where your money's going!",
          savingsOpportunity: "Once you add data, I'll find ways to save you money",
          monthlyTrend: "I need your transaction history to spot patterns",
          budgetStatus: "Set up some transactions first, then we'll talk budget",
          recommendations: ["Add your income and expenses so I can help you properly"],
          insights: ["Start tracking - you'll be shocked where your money goes!"],
          goals: ["Track expenses for one week to see your spending reality"]
        }
      });
    }

    // Deep analysis of actual transaction data
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
    
    // Detailed expense analysis with explicit typing for the accumulator
    const expensesByCategory = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: Record<string, number>, t: any) => {
        const category = t.description || 'Other';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const sortedExpenses = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number));

    // Explicitly cast these to help TypeScript know they are [string, number]
    const topSpendingCategory = sortedExpenses[0] as [string, number] | undefined;
    const secondHighest = sortedExpenses[1] as [string, number] | undefined;
    const thirdHighest = sortedExpenses[2] as [string, number] | undefined;

    // Analyze spending frequency and patterns
    const expenseTransactions = transactions.filter((t: any) => t.type === 'expense');
    const avgExpenseAmount = expenseTransactions.length > 0 
      ? totalExpenses / expenseTransactions.length 
      : 0;

    // Find recurring patterns
    const categoryFrequency = expenseTransactions.reduce((acc: any, t: any) => {
      const category = t.description || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Calculate monthly averages and trends
    const monthlyData = transactions.reduce((acc: any, t: any) => {
      const month = new Date(t.timestamp).toLocaleDateString('en-IN', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expense += t.amount;
      }
      acc[month].count += 1;
      return acc;
    }, {});

    // Create detailed transaction summary for AI
    const transactionSummary = {
      totalTransactions: transactions.length,
      incomeTransactions: transactions.filter((t: any) => t.type === 'income').length,
      expenseTransactions: expenseTransactions.length,
      averageExpense: avgExpenseAmount,
      topSpending: sortedExpenses.slice(0, 5),
      categoryFrequencies: Object.entries(categoryFrequency)
        .sort(([,a]: any, [,b]: any) => b - a)
        .slice(0, 5),
      monthlyBreakdown: Object.entries(monthlyData),
      biggestSingleExpense: expenseTransactions.length > 0 
        ? Math.max(...expenseTransactions.map((t: any) => t.amount))
        : 0,
      smallestExpense: expenseTransactions.length > 0
        ? Math.min(...expenseTransactions.map((t: any) => t.amount))
        : 0
    };

    // Much more detailed and personal prompt
    const financialPrompt = `
    You are a caring, observant financial advisor who has just spent time carefully reviewing someone's actual spending data. You notice patterns, care about their financial wellbeing, and give specific, actionable advice based on what you see.

    Here's what I found in their actual financial data:

    INCOME & EXPENSES:
    - Total Income: ₹${totalIncome.toLocaleString('en-IN')} from ${transactionSummary.incomeTransactions} transactions
    - Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')} from ${transactionSummary.expenseTransactions} transactions
    - Current Balance: ₹${balance.toLocaleString('en-IN')}
    - Savings Rate: ${savingsRate.toFixed(1)}%
    - Average expense per transaction: ₹${avgExpenseAmount.toFixed(0)}

    SPENDING BREAKDOWN (their actual money going out):
    ${transactionSummary.topSpending.map(([category, amount]: any, index: number) => 
      `${index + 1}. ${category}: ₹${amount.toLocaleString('en-IN')} (${((amount/totalExpenses)*100).toFixed(1)}% of total expenses)`
    ).join('\n')}

    SPENDING FREQUENCY PATTERNS:
    ${transactionSummary.categoryFrequencies.map(([category, count]: any) => 
      `- ${category}: ${count} times (₹${(expensesByCategory[category]/count).toFixed(0)} average each time)`
    ).join('\n')}

    THEIR BIGGEST SINGLE EXPENSE: ₹${transactionSummary.biggestSingleExpense.toLocaleString('en-IN')}
    THEIR BUDGET: ${budget ? `₹${parseInt(budget).toLocaleString('en-IN')} monthly` : 'Not set'}

    Based on this ACTUAL data, respond like you're their friend who just looked through their bank statements and genuinely cares. Be specific about what you noticed. Point out surprising patterns. Give real numbers from their data.

    Respond ONLY with valid JSON in this exact format:

    {
      "healthScore": [number 0-100 based on their actual data],
      "healthStatus": "[personal reaction to their situation like 'Yikes!', 'Not bad!', 'Concerning', 'Impressive!']",
      "topSpending": "[specific observation about their #1 expense with exact amounts - be shocked/concerned/supportive as appropriate]",
      "savingsOpportunity": "[specific suggestion based on their actual spending patterns with real numbers from their data]",
      "monthlyTrend": "[observation about their actual spending pattern/frequency based on the data]",
      "budgetStatus": "[specific comment about their budget vs actual spending with real numbers]",
      "recommendations": ["[3 specific actions based on their actual spending - mention real categories and amounts]"],
      "insights": ["[2-3 specific observations about their money habits that they might not have noticed]"],
      "goals": ["[4 specific, achievable goals based on their actual financial situation with real numbers]"]
    }

    Examples of the tone I want:
    - "Holy cow! You spent ₹${topSpendingCategory ? Math.round(topSpendingCategory[1] as number) : 0} on ${topSpendingCategory ? topSpendingCategory[0] : 'expenses'} - that's more than most people's rent!"
    - "I noticed you're spending ₹X on Y every Z days - that adds up to ₹ABC monthly!"
    - "Your ${secondHighest ? secondHighest[0] : 'second biggest'} expense is ₹${secondHighest ? Math.round(secondHighest[1] as number) : 0} - could we cut this by even 20%?"

    Be specific, caring, and use their actual numbers throughout. Make it feel like you really looked at their data!
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8, 
      }
    });

    const result = await model.generateContent(financialPrompt);
    const response = await result.response;
    const adviceText = response.text();

    let parsedAdvice;
    try {
      parsedAdvice = JSON.parse(adviceText);
      
      const requiredFields = ['healthScore', 'healthStatus', 'topSpending', 'savingsOpportunity', 
                            'monthlyTrend', 'budgetStatus', 'recommendations', 'insights', 'goals'];
      
      for (const field of requiredFields) {
        if (!parsedAdvice[field] || 
            (Array.isArray(parsedAdvice[field]) && parsedAdvice[field].length === 0) ||
            (typeof parsedAdvice[field] === 'string' && parsedAdvice[field].trim() === '')) {
          throw new Error(`Missing or empty field: ${field}`);
        }
      }
      
    } catch (parseError) {
      console.error('JSON parsing failed, using enhanced fallback:', parseError);
      
      // FIX: Explicit casting here ensures 'topAmount' and 'secondAmount' are numbers, not unknown
      const getPersonalizedAdvice = () => {
        const topCategory = topSpendingCategory ? topSpendingCategory[0] : 'expenses';
        const topAmount = topSpendingCategory ? (topSpendingCategory[1] as number) : 0;
        
        const secondCategory = secondHighest ? secondHighest[0] : 'other expenses';
        const secondAmount = secondHighest ? (secondHighest[1] as number) : 0;
        
        return {
          healthScore: Math.min(Math.max(Math.round(savingsRate + 40), 10), 95),
          healthStatus: savingsRate > 20 ? "Pretty solid!" : savingsRate > 0 ? "Needs attention" : "Yikes!",
          topSpending: topSpendingCategory 
            ? `Whoa! ₹${topAmount.toLocaleString('en-IN')} on ${topCategory}?! That's ${((topAmount/totalExpenses)*100).toFixed(0)}% of all your expenses - that's a lot!`
            : "I need to see your spending categories to give you specific advice",
          savingsOpportunity: secondHighest
            ? `Look at this - ₹${secondAmount.toLocaleString('en-IN')} on ${secondCategory}! If you cut this by just 30%, you'd save ₹${Math.round(secondAmount * 0.3).toLocaleString('en-IN')} monthly!`
            : `Your average expense is ₹${avgExpenseAmount.toFixed(0)} - let's find ways to reduce the big ones!`,
          monthlyTrend: expenseTransactions.length > 0
            ? `You're making ${expenseTransactions.length} expense transactions - that's ${(expenseTransactions.length/30).toFixed(1)} per day on average!`
            : "Start tracking daily to see your real spending rhythm",
          budgetStatus: budget 
            ? (totalExpenses <= parseInt(budget) 
               ? `Good news! You stayed ₹${(parseInt(budget) - totalExpenses).toLocaleString('en-IN')} under your ₹${parseInt(budget).toLocaleString('en-IN')} budget!` 
               : `Oops! You went ₹${(totalExpenses - parseInt(budget)).toLocaleString('en-IN')} over your ₹${parseInt(budget).toLocaleString('en-IN')} budget - let's fix this!`)
            : "You don't have a budget set - no wonder money feels out of control!",
          recommendations: [
            topSpendingCategory 
              ? `Cut your ${topCategory} spending from ₹${topAmount.toLocaleString('en-IN')} to ₹${Math.round(topAmount * 0.7).toLocaleString('en-IN')} (30% reduction = ₹${Math.round(topAmount * 0.3).toLocaleString('en-IN')} saved!)`
              : "Identify your biggest expense category first",
            `Set a strict budget of ₹${Math.round(totalExpenses * 0.8).toLocaleString('en-IN')} monthly (20% less than current ₹${totalExpenses.toLocaleString('en-IN')})`,
            transactionSummary.expenseTransactions > 50 
              ? "You're spending too frequently - try the 'one expense per day' rule"
              : "Track every single rupee for 2 weeks to spot waste"
          ],
          insights: [
            `You spend money ${transactionSummary.expenseTransactions} times but only earn ${transactionSummary.incomeTransactions} times - that's ${(transactionSummary.expenseTransactions/transactionSummary.incomeTransactions).toFixed(1)}x more spending transactions!`,
            topSpendingCategory 
              ? `${topCategory} is eating ${((topAmount/totalExpenses)*100).toFixed(0)}% of your money - more than you probably realize!`
              : "Your spending is scattered - focus on the big categories first",
            avgExpenseAmount > 1000 
              ? `Your average expense is ₹${avgExpenseAmount.toFixed(0)} - that's pretty high for everyday spending!`
              : "You make a lot of small purchases that add up fast"
          ],
          goals: [
            `Reduce ${topCategory} to ₹${Math.round(topAmount * 0.8).toLocaleString('en-IN')} by month-end`,
            `Save the ₹${Math.round(topAmount * 0.2).toLocaleString('en-IN')} you cut from ${topCategory}`,
            `Build emergency fund of ₹${Math.round(totalExpenses * 3).toLocaleString('en-IN')} (3 months expenses)`,
            balance > 0 
              ? `Increase savings rate from ${savingsRate.toFixed(0)}% to ${Math.min(savingsRate + 10, 30).toFixed(0)}%`
              : "Get to positive savings rate first - even ₹1,000/month!"
          ]
        };
      };
      
      parsedAdvice = getPersonalizedAdvice();
    }

    return NextResponse.json({ advice: parsedAdvice });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: `Failed to generate advice: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}