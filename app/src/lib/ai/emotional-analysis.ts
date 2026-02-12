export interface EmotionalAnalysis {
  tone: string;
  intensity: "baixa" | "média" | "alta";
  sentiment: "positivo" | "neutro" | "negativo" | "misto";
  tension: number; // 0-10
  suggestion: string | null;
  rewrite: string | null;
  patterns: string[]; // specific patterns detected
}

const SYSTEM_PROMPT = `Tu és o motor de inteligência relacional do Linqo. Analisas mensagens antes de serem enviadas e forneces feedback sobre o tom emocional.

Responde SEMPRE em JSON válido com esta estrutura exacta:
{
  "tone": "descrição breve do tom (ex: directo, carinhoso, defensivo, ansioso)",
  "intensity": "baixa" | "média" | "alta",
  "sentiment": "positivo" | "neutro" | "negativo" | "misto",
  "tension": número de 0 a 10,
  "suggestion": "sugestão breve para melhorar a comunicação ou null se estiver bem",
  "rewrite": "versão reformulada da mensagem ou null se não for necessário",
  "patterns": ["lista de padrões emocionais detectados"]
}

Regras:
- Sê empático e construtivo, nunca julgues
- Baseia-te em princípios de CNV (Comunicação Não Violenta)
- Se a mensagem for positiva e clara, diz isso (suggestion e rewrite ficam null)
- Se detectares tensão, sugere uma reformulação gentil
- Responde sempre em português
- Responde APENAS com o JSON, sem markdown, sem explicações`;

export async function analyzeMessage(message: string): Promise<EmotionalAnalysis> {
  return analyzeLocally(message);
}

// --- Pattern Detection ---

interface PatternMatch {
  name: string;
  label: string;
  tensionWeight: number;
  positiveWeight: number;
}

function detectPatterns(message: string): PatternMatch[] {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const original = message;
  const found: PatternMatch[] = [];

  // --- TENSION PATTERNS ---

  // Absolute language ("sempre", "nunca", "tudo", "nada")
  if (/\b(sempre|nunca|tudo|nada|ninguem|todos)\b/.test(lower)) {
    found.push({ name: "absolute", label: "Linguagem absoluta", tensionWeight: 2, positiveWeight: 0 });
  }

  // Imperative / demands ("tens de", "devias", "obrigado a", "faz isto")
  if (/\b(tens de|tens que|devias|devia|obrigado a|faz isto|para com|deixa de)\b/.test(lower)) {
    found.push({ name: "imperative", label: "Tom imperativo", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // Passive-aggressive ("ok.", "faz como quiseres", "tudo bem", "como queiras", "tanto faz")
  if (/\b(faz como quiseres|como queiras|tanto faz|tudo bem\.|ok\.|ta bem\.|pronto\.)\b/.test(lower) ||
      /\b(nao e nada|esquece|deixa estar|nao vale a pena)\b/.test(lower)) {
    found.push({ name: "passive-aggressive", label: "Pode soar passivo-agressivo", tensionWeight: 3, positiveWeight: 0 });
  }

  // Blame / accusation ("tu é que", "a culpa é", "por tua causa", "por culpa")
  if (/\b(tu e que|a culpa e|por tua causa|por culpa|es tu que|foste tu)\b/.test(lower)) {
    found.push({ name: "blame", label: "Linguagem de culpa", tensionWeight: 3, positiveWeight: 0 });
  }

  // Guilt-tripping ("depois de tudo", "eu faço tudo", "sacrifico-me", "ninguém reconhece")
  if (/\b(depois de tudo|eu faco tudo|sacrifico|ninguem reconhece|faco tudo por|ninguem agradece|eu que faco)\b/.test(lower)) {
    found.push({ name: "guilt-trip", label: "Pode gerar culpa no outro", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // Emotional frustration words
  if (/\b(irritad[oa]|frustrad[oa]|cansad[oa]|fart[oa]|sturad[oa]|exaust[oa]|saturad[oa]|esgotad[oa])\b/.test(lower)) {
    found.push({ name: "frustration", label: "Frustração evidente", tensionWeight: 2, positiveWeight: 0 });
  }

  // Threats / ultimatums ("ou então", "se não", "é a última vez", "acaba aqui")
  if (/\b(ou entao|e a ultima vez|acaba aqui|nao te perdoo|acabou|chega)\b/.test(lower)) {
    found.push({ name: "ultimatum", label: "Tom de ultimato", tensionWeight: 3.5, positiveWeight: 0 });
  }

  // Aggressive questioning ("porquê que", "porque é que nunca", "quando é que vais")
  if (/\b(porque e que (nunca|sempre|nao)|quando e que vais|porque que)\b/.test(lower)) {
    found.push({ name: "aggressive-question", label: "Pergunta acusatória", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // Sarcasm indicators ("claro que sim", "que surpresa", "quem diria", "incrível como")
  if (/\b(claro que sim|que surpresa|quem diria|incrivel como|como se|ai sim)\b/.test(lower)) {
    found.push({ name: "sarcasm", label: "Pode soar sarcástico", tensionWeight: 2, positiveWeight: 0 });
  }

  // "Precisamos de falar" — classic anxiety trigger
  if (/\b(precisamos de falar|temos de falar|temos que falar|precisamos de conversar)\b/.test(lower)) {
    found.push({ name: "talk-trigger", label: "\"Precisamos de falar\" gera ansiedade", tensionWeight: 2, positiveWeight: 0 });
  }

  // Controlling language ("não podes", "proíbo-te", "não vais")
  if (/\b(nao podes|proibo|nao te deixo|nao vais|nao te atrevas)\b/.test(lower)) {
    found.push({ name: "controlling", label: "Linguagem de controlo", tensionWeight: 3, positiveWeight: 0 });
  }

  // Dismissive ("não interessa", "não quero saber", "pouco me importa")
  if (/\b(nao interessa|nao quero saber|pouco me importa|nao me interessa|que se lixe)\b/.test(lower)) {
    found.push({ name: "dismissive", label: "Tom desdenhoso", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- FORMATTING PATTERNS ---

  // ALL CAPS (shouting)
  if (original === original.toUpperCase() && original.length > 8 && /[A-Z]/.test(original)) {
    found.push({ name: "shouting", label: "MAIÚSCULAS = gritar em texto", tensionWeight: 3, positiveWeight: 0 });
  }

  // Excessive punctuation
  if (/[!?]{3,}/.test(original)) {
    found.push({ name: "excess-punctuation", label: "Pontuação excessiva aumenta intensidade", tensionWeight: 2, positiveWeight: 0 });
  } else if (/[!?]{2}/.test(original)) {
    found.push({ name: "double-punctuation", label: "Pontuação dupla transmite urgência", tensionWeight: 1, positiveWeight: 0 });
  }

  // Very short response (under 15 chars) with period — can feel cold
  if (original.length < 15 && original.endsWith(".") && !original.includes("!") && !/\b(obrigad|amo|gosto|adoro)\b/.test(lower)) {
    found.push({ name: "cold-short", label: "Resposta curta com ponto final pode soar fria", tensionWeight: 1.5, positiveWeight: 0 });
  }

  // --- POSITIVE PATTERNS ---

  // Gratitude
  if (/\b(obrigad[oa]|agradeco|muito obrigad[oa]|obrigadissim[oa])\b/.test(lower)) {
    found.push({ name: "gratitude", label: "Gratidão", tensionWeight: 0, positiveWeight: 3 });
  }

  // Love / affection
  if (/\b(amo[- ]te|adoro[- ]te|amo|adoro|querido|querida|amor|meu amor|minha vida)\b/.test(lower)) {
    found.push({ name: "love", label: "Carinho e afecto", tensionWeight: 0, positiveWeight: 3 });
  }

  // Encouragement / support
  if (/\b(parabens|orgulho|incrivel|fantastico|maravilhos[oa]|muito bem|bom trabalho|estou contigo|conto contigo)\b/.test(lower)) {
    found.push({ name: "encouragement", label: "Encorajamento", tensionWeight: 0, positiveWeight: 2.5 });
  }

  // Empathy / vulnerability
  if (/\b(compreendo|entendo|percebo como|sei que e dificil|estou aqui para|podes contar comigo|desculpa|perdao)\b/.test(lower)) {
    found.push({ name: "empathy", label: "Empatia e vulnerabilidade", tensionWeight: 0, positiveWeight: 2.5 });
  }

  // Warmth / friendly
  if (/\b(saudade|como estas|tudo bem contigo|gosto de|gostava de|feliz|contente|alegri[ae])\b/.test(lower)) {
    found.push({ name: "warmth", label: "Tom acolhedor", tensionWeight: 0, positiveWeight: 2 });
  }

  // Invitation / openness
  if (/\b(o que achas|queres|gostavas de|podemos|vamos|quando puderes|quando quiseres|se quiseres)\b/.test(lower)) {
    found.push({ name: "invitation", label: "Convite aberto", tensionWeight: 0, positiveWeight: 1.5 });
  }

  return found;
}

// --- Tone Classification ---

function classifyTone(tension: number, positiveScore: number, patterns: PatternMatch[]): string {
  const patternNames = patterns.map(p => p.name);

  if (patternNames.includes("passive-aggressive")) return "passivo-agressivo";
  if (patternNames.includes("ultimatum")) return "ultimato ou ameaça";
  if (patternNames.includes("blame")) return "acusatório";
  if (patternNames.includes("guilt-trip")) return "manipulação emocional";
  if (patternNames.includes("sarcasm")) return "sarcástico";
  if (patternNames.includes("controlling")) return "controlador";
  if (patternNames.includes("dismissive")) return "desdenhoso";
  if (patternNames.includes("shouting")) return "agressivo";

  if (tension > 7) return "muito tenso e conflituoso";
  if (tension > 5) return "tenso e directo";
  if (tension > 3) return "ligeiramente directo";

  if (patternNames.includes("love")) return "carinhoso e amoroso";
  if (patternNames.includes("empathy")) return "empático e acolhedor";
  if (patternNames.includes("gratitude")) return "agradecido";
  if (patternNames.includes("encouragement")) return "encorajador";
  if (patternNames.includes("warmth")) return "amigável e caloroso";
  if (patternNames.includes("invitation")) return "aberto e convidativo";

  if (positiveScore > 3) return "positivo e claro";
  if (positiveScore > 1) return "amigável";

  return "neutro e claro";
}

// --- Smart Rewrite ---

function generateRewrite(message: string, tension: number, patterns: PatternMatch[]): string | null {
  if (tension <= 3) return null;

  const patternNames = patterns.map(p => p.name);
  let rewrite = message;

  // Absolute language softeners
  rewrite = rewrite.replace(/\bsempre\b/gi, "muitas vezes");
  rewrite = rewrite.replace(/\bnunca\b/gi, "raramente");
  rewrite = rewrite.replace(/\btudo\b/gi, (match) => {
    // Don't replace "tudo bem"
    const idx = rewrite.toLowerCase().indexOf("tudo bem");
    if (idx !== -1) return match;
    return "grande parte";
  });
  rewrite = rewrite.replace(/\bnada\b/gi, "pouco");

  // Imperative softeners
  rewrite = rewrite.replace(/\btens de\b/gi, "seria bom se pudesses");
  rewrite = rewrite.replace(/\btens que\b/gi, "seria bom se pudesses");
  rewrite = rewrite.replace(/\bdevias\b/gi, "talvez possas considerar");
  rewrite = rewrite.replace(/\bdevia\b/gi, "talvez pudesse");
  rewrite = rewrite.replace(/\bpara com\b/gi, "preferia que não");
  rewrite = rewrite.replace(/\bdeixa de\b/gi, "preferia que não");

  // Passive-aggressive rewrites
  if (patternNames.includes("passive-aggressive")) {
    rewrite = rewrite.replace(/\bfaz como quiseres\b/gi, "gostava de encontrar uma solução juntos");
    rewrite = rewrite.replace(/\bcomo queiras\b/gi, "o que achas que seria melhor?");
    rewrite = rewrite.replace(/\btanto faz\b/gi, "não tenho uma preferência forte, e tu?");
    rewrite = rewrite.replace(/\bnão é nada\b/gi, "há algo que me está a incomodar");
    rewrite = rewrite.replace(/\besquece\b/gi, "quero falar sobre isto, mas talvez noutra altura");
    rewrite = rewrite.replace(/\bdeixa estar\b/gi, "prefiro conversar sobre isto quando estivermos calmos");
  }

  // Blame rewrites (shift from "tu" to "eu sinto")
  if (patternNames.includes("blame")) {
    rewrite = rewrite.replace(/\btu é que\b/gi, "sinto que");
    rewrite = rewrite.replace(/\ba culpa é tua\b/gi, "sinto-me frustrado/a com esta situação");
    rewrite = rewrite.replace(/\bpor tua causa\b/gi, "quando isto acontece, eu sinto");
    rewrite = rewrite.replace(/\bfoste tu\b/gi, "senti que");
  }

  // "Precisamos de falar" softener
  if (patternNames.includes("talk-trigger")) {
    rewrite = rewrite.replace(/\bprecisamos de falar\b/gi, "gostava de conversar contigo quando tiveres disponibilidade");
    rewrite = rewrite.replace(/\btemos de falar\b/gi, "gostava de conversar contigo quando tiveres um momento");
    rewrite = rewrite.replace(/\btemos que falar\b/gi, "gostava de conversar contigo quando puderes");
    rewrite = rewrite.replace(/\bprecisamos de conversar\b/gi, "gostava de conversar contigo sobre algo");
  }

  // Guilt-trip rewrites
  if (patternNames.includes("guilt-trip")) {
    rewrite = rewrite.replace(/\bdepois de tudo o que\b/gi, "valorizo o que");
    rewrite = rewrite.replace(/\beu faço tudo\b/gi, "sinto que tenho feito muito");
    rewrite = rewrite.replace(/\bninguém reconhece\b/gi, "gostava de me sentir mais reconhecido/a");
    rewrite = rewrite.replace(/\bninguém agradece\b/gi, "gostava de sentir mais reconhecimento");
  }

  // Remove excessive punctuation
  rewrite = rewrite.replace(/!{2,}/g, ".");
  rewrite = rewrite.replace(/\?{2,}/g, "?");

  // If ALL CAPS, convert to normal case
  if (patternNames.includes("shouting")) {
    rewrite = rewrite.charAt(0).toUpperCase() + rewrite.slice(1).toLowerCase();
  }

  // Return null if nothing changed
  return rewrite !== message ? rewrite : null;
}

// --- Suggestion Generator ---

function generateSuggestion(tension: number, patterns: PatternMatch[]): string | null {
  const patternNames = patterns.map(p => p.name);

  // Specific suggestions based on patterns detected
  if (patternNames.includes("passive-aggressive")) {
    return "Esta mensagem esconde o que realmente sentes. Experimenta expressar directamente a tua frustração — é mais vulnerável, mas cria mais ligação.";
  }

  if (patternNames.includes("ultimatum")) {
    return "O tom de ultimato fecha portas ao diálogo. Se estás a chegar ao limite, expressa o que sentes sem ameaçar — o impacto é maior.";
  }

  if (patternNames.includes("blame")) {
    return "A linguagem de culpa activa a defensividade do outro. Experimenta trocar \"tu\" por \"eu sinto\" — a mensagem chega sem que o outro precise de se defender.";
  }

  if (patternNames.includes("guilt-trip")) {
    return "Esta mensagem pode gerar culpa em vez de empatia. Expressa o que precisas directamente, sem referir o que já fizeste — é mais poderoso.";
  }

  if (patternNames.includes("sarcasm")) {
    return "O sarcasmo em texto é arriscado — sem tom de voz, é quase sempre interpretado como ataque. Diz o que sentes directamente.";
  }

  if (patternNames.includes("controlling")) {
    return "Linguagem de controlo afasta, não aproxima. Experimenta expressar o que precisas sem decidir pelo outro.";
  }

  if (patternNames.includes("dismissive")) {
    return "Desvalorizar a conversa magoa mais do que discordar. Se precisas de espaço, diz isso directamente.";
  }

  if (patternNames.includes("talk-trigger")) {
    return "\"Precisamos de falar\" é das frases que mais gera ansiedade. Adiciona contexto e um tom aberto para não criar pânico.";
  }

  if (patternNames.includes("shouting")) {
    return "MAIÚSCULAS em texto = gritar. Mesmo que não seja a tua intenção, é assim que vai ser lido. Baixa o tom para seres ouvida.";
  }

  if (patternNames.includes("aggressive-question")) {
    return "As perguntas que começam com \"porquê\" podem soar como acusação. Experimenta reformular como pedido.";
  }

  if (patternNames.includes("cold-short")) {
    return "Respostas curtas com ponto final podem parecer frias ou distantes. Se é intencional, tudo bem. Se não, adiciona um pouco mais.";
  }

  if (tension > 5) {
    return "Esta mensagem pode soar mais intensa do que pretendes. Experimenta suavizar o tom antes de enviar.";
  }

  if (tension > 3) {
    return "O tom está um pouco directo. Podes adicionar uma abertura mais suave para que a mensagem chegue melhor.";
  }

  return null;
}

// --- Main Analysis ---

function analyzeLocally(message: string): EmotionalAnalysis {
  const patterns = detectPatterns(message);

  let tension = 0;
  let positiveScore = 0;

  for (const p of patterns) {
    tension += p.tensionWeight;
    positiveScore += p.positiveWeight;
  }

  tension = Math.min(10, Math.max(0, Math.round(tension)));

  const sentiment: EmotionalAnalysis["sentiment"] =
    positiveScore > 3 && tension < 3
      ? "positivo"
      : tension > 5
        ? "negativo"
        : tension > 2 && positiveScore > 1
          ? "misto"
          : positiveScore > 1 && tension <= 2
            ? "positivo"
            : "neutro";

  const intensity: EmotionalAnalysis["intensity"] =
    tension > 6 ? "alta" : tension > 3 ? "média" : "baixa";

  const tone = classifyTone(tension, positiveScore, patterns);
  const suggestion = generateSuggestion(tension, patterns);
  const rewrite = generateRewrite(message, tension, patterns);

  return {
    tone,
    intensity,
    sentiment,
    tension,
    suggestion,
    rewrite,
    patterns: patterns.map(p => p.label),
  };
}

export { SYSTEM_PROMPT };
