import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PARSE_PROMPT, SPLIT_PROMPT, GOAL_PROMPT, DEBT_PROMPT } from '@/lib/ai/prompts';

// ─── Model config ─────────────────────────────────────────────────────────────
// Prefer gemini-3-flash-preview (Gemini 3 Flash, Preview).
// Auto-fallback to gemini-2.5-flash (Stable GA) when preview model is at capacity (503).
const MODEL_CHAIN = [
  'gemini-3-flash-preview',  // Gemini 3 Flash — try first
  'gemini-2.5-flash',        // Stable fallback
] as const;

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── Gemini REST API caller with model-chain fallback ──────────────────────────
async function callGemini(
  contents: object[],
  systemInstruction: string,
  maxTokens = 512,   // increased — JSON mode is verbose
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY tidak dikonfigurasi di server.');

  let lastError: Error | null = null;

  for (const model of MODEL_CHAIN) {
    try {
      const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json',
          },
        }),
      });

      // 503 = model at capacity, try next model in chain
      if (res.status === 503) {
        console.warn(`[parse] Model ${model} at capacity (503), trying next...`);
        lastError = new Error(`Model ${model} tidak tersedia saat ini.`);
        continue;
      }

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[parse] Gemini ${model} error ${res.status}:`, errBody.slice(0, 300));
        throw new Error(`Gemini API error ${res.status}: ${errBody.slice(0, 150)}`);
      }

      const json = await res.json();
      const candidate  = json?.candidates?.[0];
      const rawText: string = candidate?.content?.parts?.[0]?.text ?? '';
      const finishReason: string = candidate?.finishReason ?? 'unknown';

      if (!rawText) {
        console.error(`[parse] Empty response from ${model}. finishReason: ${finishReason}`);
        lastError = new Error(`AI tidak menghasilkan respons (${finishReason}).`);
        continue; // try next model instead of throwing
      }

      // Try to parse JSON even if cut off (MAX_TOKENS can still produce valid JSON)
      try {
        const parsed = JSON.parse(rawText);
        if (finishReason === 'MAX_TOKENS') {
          console.warn(`[parse] MAX_TOKENS hit on ${model} but JSON was complete.`);
        }
        console.log(`[parse] Success with model: ${model}`);
        return parsed;
      } catch {
        if (finishReason === 'MAX_TOKENS') {
          console.warn(`[parse] MAX_TOKENS + invalid JSON from ${model}, trying next model...`);
          lastError = new Error('Respons AI terpotong. Mencoba model lain...');
          continue; // try next model
        }
        console.error(`[parse] Non-JSON from ${model}:`, rawText.slice(0, 200));
        throw new Error('AI gagal menghasilkan JSON. Coba tulis kalimat berbeda.');
      }
    } catch (err: any) {
      // If the error is a capacity error (from the continue above), keep going
      if (lastError && err.message === lastError.message) continue;
      // Otherwise rethrow — it's a real error
      throw err;
    }
  }

  // All models exhausted
  throw lastError ?? new Error('Semua model AI tidak tersedia saat ini. Coba lagi nanti.');
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    // Parse body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid.' }, { status: 400 });
    }

    // Accept both naming conventions from clients
    const text: string | undefined      = (body.text || body.input || '').trim() || undefined;
    const rawImage: string | undefined  = body.imageBase64 || body.image || undefined;
    const mode: string | undefined      = body.mode;

    // Strip data-URL prefix added by FileReader.readAsDataURL()
    const imageBase64: string | undefined = rawImage
      ? rawImage.replace(/^data:[^;]+;base64,/, '')
      : undefined;

    if (!text && !imageBase64) {
      return NextResponse.json({ error: 'Input tidak boleh kosong.' }, { status: 400 });
    }
    if (text && text.length > 500) {
      return NextResponse.json(
        { error: 'Teks terlalu panjang (maks 500 karakter).' },
        { status: 400 },
      );
    }

    // Sanitize text — strip HTML tags
    const sanitized: string | undefined = text
      ? text.replace(/<[^>]*>?/gm, '').trim()
      : undefined;

    // ── Mode routing ──────────────────────────────────────────────────────────
    if (mode === 'debt' && sanitized) {
      const data = await callGemini(
        [{ role: 'user', parts: [{ text: sanitized }] }],
        DEBT_PROMPT, 256,
      );
      return NextResponse.json(data);
    }

    if (mode === 'goal' && sanitized) {
      const data = await callGemini(
        [{ role: 'user', parts: [{ text: sanitized }] }],
        GOAL_PROMPT, 256,
      );
      return NextResponse.json(data);
    }

    if (mode === 'split' && sanitized) {
      const data = await callGemini(
        [{ role: 'user', parts: [{ text: sanitized }] }],
        SPLIT_PROMPT, 256,
      );
      return NextResponse.json(data);
    }

    // ── Default: transaction parsing (text or receipt image) ─────────────────
    let parts: object[];

    if (imageBase64) {
      const mimeMatch = rawImage?.match(/^data:([^;]+);base64,/);
      const mimeType  = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      parts = [
        { inlineData: { mimeType, data: imageBase64 } },
        {
          text: sanitized
            ? `Baca struk/nota dari gambar. Catatan user: "${sanitized}". Output JSON only.`
            : 'Baca semua informasi transaksi dari gambar struk ini. Output JSON only.',
        },
      ];
    } else {
      parts = [{ text: sanitized! }];
    }

    const data = await callGemini(
      [{ role: 'user', parts }],
      PARSE_PROMPT,
      imageBase64 ? 768 : 512,  // images need more tokens
    );
    return NextResponse.json(data);

  } catch (error: any) {
    const msg: string = error?.message ?? '';
    console.error('[/api/parse] Error:', msg);

    if (msg.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ error: 'Konfigurasi server bermasalah.' }, { status: 500 });
    }
    if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      return NextResponse.json({ error: 'Kuota AI habis. Coba beberapa menit lagi.' }, { status: 429 });
    }
    if (msg.includes('tidak tersedia') || msg.includes('capacity')) {
      return NextResponse.json({ error: 'Model AI sedang overload. Coba lagi sebentar.' }, { status: 503 });
    }

    return NextResponse.json(
      { error: msg || 'Terjadi kesalahan server.' },
      { status: 500 },
    );
  }
}
