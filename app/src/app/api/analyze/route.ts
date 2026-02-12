import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, type EmotionalAnalysis } from "@/lib/ai/emotional-analysis";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });
    }

    // If OpenAI API key is available, use it for deep analysis
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback to local analysis (imported from the module)
      const { analyzeMessage } = await import("@/lib/ai/emotional-analysis");
      const result = await analyzeMessage(message);
      return NextResponse.json(result);
    }

    // Call AI API for deep emotional analysis
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const { analyzeMessage } = await import("@/lib/ai/emotional-analysis");
      const result = await analyzeMessage(message);
      return NextResponse.json(result);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    const analysis: EmotionalAnalysis = JSON.parse(content);
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      { error: "Erro na análise" },
      { status: 500 }
    );
  }
}
