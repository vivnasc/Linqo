export interface EmotionalAnalysis {
  tone: string;
  intensity: "baixa" | "média" | "alta";
  sentiment: "positivo" | "neutro" | "negativo" | "misto";
  tension: number; // 0-10
  suggestion: string | null;
  rewrite: string | null;
}

const SYSTEM_PROMPT = `Tu és o motor de inteligência relacional do Linqo. Analisas mensagens antes de serem enviadas e forneces feedback sobre o tom emocional.

Responde SEMPRE em JSON válido com esta estrutura exacta:
{
  "tone": "descrição breve do tom (ex: directo, carinhoso, defensivo, ansioso)",
  "intensity": "baixa" | "média" | "alta",
  "sentiment": "positivo" | "neutro" | "negativo" | "misto",
  "tension": número de 0 a 10,
  "suggestion": "sugestão breve para melhorar a comunicação ou null se estiver bem",
  "rewrite": "versão reformulada da mensagem ou null se não for necessário"
}

Regras:
- Sê empático e construtivo, nunca julgues
- Baseia-te em princípios de CNV (Comunicação Não Violenta)
- Se a mensagem for positiva e clara, diz isso (suggestion e rewrite ficam null)
- Se detectares tensão, sugere uma reformulação gentil
- Responde sempre em português
- Responde APENAS com o JSON, sem markdown, sem explicações`;

export async function analyzeMessage(message: string): Promise<EmotionalAnalysis> {
  // Client-side analysis using a simple heuristic as fallback
  // In production, this would call an AI API endpoint
  return analyzeLocally(message);
}

function analyzeLocally(message: string): EmotionalAnalysis {
  const lower = message.toLowerCase();

  // Tension indicators
  const tensionWords = [
    "precisamos", "sempre", "nunca", "porquê", "culpa",
    "mas", "no entanto", "obrigado a", "tens de", "devias",
    "irritado", "frustrado", "cansado", "farto",
  ];

  const positiveWords = [
    "obrigado", "amo", "gosto", "adoro", "parabéns",
    "orgulho", "incrível", "fantástico", "feliz", "contente",
    "agradeço", "saudade", "querido", "querida",
  ];

  const questionPatterns = /\?{2,}|!{2,}|porqu[eê]/i;

  let tension = 0;
  let positiveScore = 0;

  tensionWords.forEach((word) => {
    if (lower.includes(word)) tension += 1.5;
  });

  positiveWords.forEach((word) => {
    if (lower.includes(word)) positiveScore += 2;
  });

  if (questionPatterns.test(message)) tension += 2;
  if (message === message.toUpperCase() && message.length > 5) tension += 3;
  if (message.includes("!!!")) tension += 2;

  tension = Math.min(10, Math.max(0, tension));

  const sentiment: EmotionalAnalysis["sentiment"] =
    positiveScore > 3 && tension < 3
      ? "positivo"
      : tension > 5
        ? "negativo"
        : tension > 2 && positiveScore > 1
          ? "misto"
          : "neutro";

  const intensity: EmotionalAnalysis["intensity"] =
    tension > 6 ? "alta" : tension > 3 ? "média" : "baixa";

  let tone = "neutro e claro";
  if (tension > 6) tone = "tenso e directo";
  else if (tension > 3) tone = "ligeiramente directo";
  else if (positiveScore > 3) tone = "carinhoso e positivo";
  else if (positiveScore > 1) tone = "amigável";

  let suggestion: string | null = null;
  let rewrite: string | null = null;

  if (tension > 5) {
    suggestion =
      "Esta mensagem pode soar mais intensa do que pretendes. Experimenta suavizar o tom.";
    rewrite = message
      .replace(/tens de/gi, "seria bom se pudesses")
      .replace(/devias/gi, "talvez possas considerar")
      .replace(/sempre/gi, "muitas vezes")
      .replace(/nunca/gi, "raramente");
  } else if (tension > 3) {
    suggestion =
      "O tom está um pouco directo. Podes adicionar uma abertura mais suave.";
  }

  return {
    tone,
    intensity,
    sentiment,
    tension: Math.round(tension),
    suggestion,
    rewrite: rewrite !== message ? rewrite : null,
  };
}

export { SYSTEM_PROMPT };
