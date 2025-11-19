import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { adviceCache, cosineSim, compactContext } from '@/lib/adviceCache';

interface FinancialData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseCategories: Record<string, number>;
  recentTransactions: string[];
  transactionCount: number;
}

interface RequestBody {
  message: string;
  language: 'en' | 'hi';
  financialData: FinancialData;
  userId: string;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(request: NextRequest) {
  let languageFallback: 'en' | 'hi' = 'en';

  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ API key not configured' }, { status: 500 });
    }

    const body: RequestBody = await request.json();
    const { message, language, financialData, userId } = body;
    languageFallback = language;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // RAG STEP 1: Check cache first for similar questions (saves 70% API calls)
    const cacheKey = `${userId}_${message.toLowerCase().trim()}`;

    // Exact match first
    const exactMatch = adviceCache.get(cacheKey);
    if (exactMatch) {
      return NextResponse.json({
        message: exactMatch,
        source: 'cache_exact',
        cached: true
      });
    }

    // Fuzzy match for similar questions
    for (const [cachedQuestion, cachedAnswer] of adviceCache.entries()) {
      if (cosineSim(cachedQuestion.split('_')[1] || '', message) > 0.85) {
        return NextResponse.json({
          message: cachedAnswer,
          source: 'cache_similar',
          cached: true
        });
      }
    }

    // RAG STEP 2: Prepare compact financial context
    const financialContext = compactContext(financialData);

    // Emotional context based on financial health
    const getEmotionalContext = (balance: number, lang: 'en' | 'hi') => {
      if (balance < -5000) {
        return lang === 'hi'
          ? "मैं समझता हूं कि यह कठिन समय है। आप अकेले नहीं हैं।"
          : "I understand this is a challenging time. You're not alone.";
      } else if (balance > 10000) {
        return lang === 'hi'
          ? "आपकी मेहनत रंग ला रही है! मैं आपकी वित्तीय यात्रा में साथ हूं।"
          : "Your hard work is paying off! I'm here to support your journey.";
      }
      return "";
    };

    const emotionalNote = getEmotionalContext(financialData.balance, language);

    const systemPrompt = language === 'hi'
      ? `आप BudgetBot हैं - एक दयालु, समझदार वित्तीय साथी जो उपयोगकर्ता की भावनाओं को समझते हैं।

वित्तीय स्थिति: ${financialContext}
${emotionalNote}

लक्ष्य:
- सहानुभूति और समझदारी दिखाना
- व्यावहारिक सलाह देना बिना जजमेंट के
- उम्मीद और प्रेरणा देना
- व्यक्तिगत स्पर्श जोड़ना

60-100 शब्दों में गर्मजोशी से जवाब दें।`
      : `You are BudgetBot - a compassionate, understanding financial companion who genuinely cares about user wellbeing.

Financial Status: ${financialContext}
${emotionalNote}

Mission:
- Show empathy and understanding
- Give practical advice without judgment
- Inspire hope and confidence
- Add personal touches
- Celebrate progress and acknowledge struggles

Respond in 60-100 words with warmth and care.`;

    const optimizedPrompt = `${systemPrompt}

User: "${message}"

Respond with genuine care and helpful guidance:`;

    // RAG STEP 3: Generate response only if no cache hit
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.9,
      max_tokens: 350
    });
    let text = chatCompletion.choices[0]?.message.content || '';

    // Add contextual emotional enhancers (no emojis)
    const emotionalEnhancers = {
      hi: {
        positive: ["बहुत बढ़िया!", "शानदार प्रगति!", "गर्व की बात है!"],
        supportive: ["मैं आपके साथ हूं", "हम मिलकर करेंगे", "आप कर सकते हैं"],
        encouraging: ["धैर्य रखें", "हर कदम मायने रखता है", "सफलता आएगी"]
      },
      en: {
        positive: ["Excellent progress!", "You're doing great!", "Impressive work!"],
        supportive: ["I'm here for you", "We'll work through this", "You've got this"],
        encouraging: ["Stay strong", "Every step counts", "Success is coming"]
      }
    };

    const enhancers = emotionalEnhancers[language];
    if (financialData.balance > 5000) {
      const randomPositive = enhancers.positive[Math.floor(Math.random() * enhancers.positive.length)];
      text += ` ${randomPositive}`;
    } else if (financialData.balance < -1000) {
      const randomSupport = enhancers.supportive[Math.floor(Math.random() * enhancers.supportive.length)];
      text = `${randomSupport}. ` + text;
    }

    // RAG STEP 4: Save to cache for future retrieval
    adviceCache.set(cacheKey, text);

    return NextResponse.json({
      message: text,
      source: 'groq_fresh',
      cached: false,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Groq API Error:', error);

    const emotionalErrorMessage = languageFallback === 'hi'
      ? 'मुझे खुशी होगी अगर मैं इस समय आपकी मदद कर सकूं, लेकिन तकनीकी समस्या है। कृपया फिर कोशिश करें।'
      : 'I wish I could help you right now, but I\'m having technical difficulties. Please try again in a moment.';

    return NextResponse.json({
      message: emotionalErrorMessage,
      source: 'error',
      error: `Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
