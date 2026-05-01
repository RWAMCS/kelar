import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clearCache = searchParams.get('clear') === '1';

    const cacheKey = `insight:${user.id}`;
    
    // Clear cache if requested
    if (clearCache) {
      await redis.del(cacheKey);
    } else {
      // Return cached insight
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // 3. Query Supabase
    // get transactions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD format

    const { data: txData, error } = await supabase
      .from('transactions')
      .select('type, amount, category, date')
      .eq('user_id', user.id)
      .gte('date', dateStr);

    if (error) throw error;

    let total_expense = 0;
    let total_income = 0;
    let biggest_single = 0;
    const categoryMap: { [key: string]: number } = {};

    (txData || []).forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === 'expense') {
        total_expense += amount;
        categoryMap[tx.category || 'Lainnya'] = (categoryMap[tx.category || 'Lainnya'] || 0) + amount;
        if (amount > biggest_single) biggest_single = amount;
      } else if (tx.type === 'income') {
        total_income += amount;
      }
    });

    // Top 3 categories
    const top3_categories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));

    // Savings rate
    const savings_rate = total_income > 0 
      ? Math.round(((total_income - total_expense) / total_income) * 100) 
      : 0;

    const summary = {
      total_expense,
      total_income,
      top3_categories,
      biggest_single,
      savings_rate
    };

    // 5. Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const prompt = `Analisa keuangan. JSON only.
Data: ${JSON.stringify(summary)}
Output: {"insights":[{"type":"warning|tip|achievement","title":"","body":""}],"health_score":0,"health_label":"Rawan|Stabil|Sehat|Elite"}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.2, // low temp for structured
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    let jsonOutput;
    
    try {
      jsonOutput = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({ error: 'AI failed to output valid JSON' }, { status: 500 });
    }

    // 6. Simpan ke Redis (TTL 24 jam = 86400 detik)
    await redis.set(cacheKey, jsonOutput, { ex: 86400 });

    return NextResponse.json(jsonOutput);

  } catch (error: any) {
    console.error("API Insight Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
