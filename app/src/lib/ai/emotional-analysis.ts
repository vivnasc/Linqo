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

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectPatterns(message: string): PatternMatch[] {
  const n = normalize(message);
  const original = message;
  const words = n.split(/\s+/);
  const wordCount = words.length;
  const found: PatternMatch[] = [];

  // ============================================================
  // TENSION PATTERNS — ordered from subtle to obvious
  // ============================================================

  // --- Terse / cold responses ---
  // "Ok", "Está bem", "Pois", "Sim sim", "Já percebi", "Certo"
  const tersePatterns = /^(ok|esta bem|pois|sim sim|sim|certo|ja percebi|ja vi|pronto|hmm|hm|ta|ta bem|ya|k|percebi)\.?$/;
  if (tersePatterns.test(n.trim())) {
    found.push({ name: "terse", label: "Resposta seca — pode soar fria ou distante", tensionWeight: 2, positiveWeight: 0 });
  }

  // Short message with period (not already terse)
  if (!found.some(f => f.name === "terse") && original.length < 20 && original.endsWith(".") && wordCount <= 4 && !/\b(obrigad|amo|gosto|adoro|beijinho|beijo)\b/.test(n)) {
    found.push({ name: "cold-short", label: "Resposta curta com ponto final pode soar fria", tensionWeight: 1.5, positiveWeight: 0 });
  }

  // --- Subtle dismissal ---
  // "Já percebi", "Eu sei", "Não é preciso", "Não te preocupes", "Deixa lá"
  if (/\b(ja percebi|eu sei|nao e preciso|nao te preocupes|deixa la|nao faz mal|esta tudo bem|nao ha problema)\b/.test(n) && wordCount < 8) {
    if (!found.some(f => f.name === "terse")) {
      found.push({ name: "subtle-dismissal", label: "Pode minimizar algo que importa", tensionWeight: 1.5, positiveWeight: 0 });
    }
  }

  // --- Repetition frustration ---
  // "Outra vez", "Mais uma vez", "Já te disse", "Quantas vezes", "Sempre a mesma coisa"
  if (/\b(outra vez|mais uma vez|ja te disse|quantas vezes|sempre a mesma|mesma coisa|a mesma historia|de novo|ja falamos sobre|ja discutimos|nao e a primeira vez)\b/.test(n)) {
    found.push({ name: "repetition-frustration", label: "Frustração com repetição", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- Questioning with edge ---
  // "A sério?", "E depois?", "E então?", "O que queres que faça?", "Que queres que te diga?"
  if (/\b(a serio\??|e depois\??|e entao\??|o que e que queres|que queres que (eu |te )?fa[cç]a|que queres que te diga|o que esperas|o que queres de mim)\b/.test(n)) {
    found.push({ name: "edge-question", label: "Pergunta com carga emocional", tensionWeight: 2, positiveWeight: 0 });
  }

  // --- Resigned / hopeless ---
  // "Não sei para quê", "Tanto faz", "Já não sei", "Não vale a pena", "Para quê"
  if (/\b(nao sei para que|ja nao sei|nao sei o que fazer|ja nao aguento|ja nao consigo|nao sei mais|para que e que|desisto|nao sei que mais|nao adianta|sem sentido)\b/.test(n)) {
    found.push({ name: "resigned", label: "Tom de desistência ou exaustão", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- "Lá estás tu" / accusation-lite ---
  if (/\b(la estas tu|la vens tu|es sempre assim|mais uma das tuas|tipico|como de costume|como sempre|nao me surpreende)\b/.test(n)) {
    found.push({ name: "accusation-lite", label: "Acusação subtil", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- Passive-aggressive ---
  if (/\b(faz como quiseres|como queiras|tanto faz|ok\.|ta bem\.|pronto\.|faz o que (tu )?quiseres|fica a vontade|se achas que sim|se tu dizes|se e isso que achas|se e isso que queres)\b/.test(n) ||
      /\b(nao e nada|esquece|deixa estar|nao vale a pena|esquece o que disse|nao me oiças|nao ligues)\b/.test(n)) {
    if (!found.some(f => f.name === "terse")) {
      found.push({ name: "passive-aggressive", label: "Pode soar passivo-agressivo", tensionWeight: 3, positiveWeight: 0 });
    }
  }

  // --- Forced/sarcastic apology ---
  // "Pronto, desculpa", "Desculpa lá", "Peço imensa desculpa" (with sarcasm)
  if (/\b(pronto,? desculpa|desculpa la|ta bem,? desculpa|pronto ja pedi desculpa|peco imensa desculpa)\b/.test(n)) {
    found.push({ name: "forced-apology", label: "Pedido de desculpa que pode soar forçado", tensionWeight: 2, positiveWeight: 0 });
  }

  // --- Self-blame (passive-aggressive form) ---
  // "Se calhar sou eu", "A culpa deve ser minha", "Eu é que sou parvo/a"
  if (/\b(se calhar sou eu|a culpa (deve ser|e) minha|eu e que sou parv|eu e que estou mal|o problema sou eu|se calhar o problema sou eu)\b/.test(n)) {
    found.push({ name: "self-blame-passive", label: "Auto-culpa que gera culpa no outro", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- Absolute language ("sempre", "nunca", "tudo", "nada") ---
  // Only when used in emotional context, not factual
  const absoluteWords = (n.match(/\b(sempre|nunca)\b/g) || []).length;
  if (absoluteWords > 0) {
    // Check it's not in a clearly positive context like "amo-te sempre"
    const positiveAbsolute = /\b(amo[- ]te sempre|adoro[- ]te sempre|sempre te amei|gosto sempre)\b/.test(n);
    if (!positiveAbsolute) {
      found.push({ name: "absolute", label: "\"Sempre\"/\"Nunca\" raramente é literal — gera defensividade", tensionWeight: 1.5 * absoluteWords, positiveWeight: 0 });
    }
  }

  // "Tudo" / "nada" in emotional context
  if (/\b(nada (me |do que |que ))|(\btudo (errado|mal)\b)/.test(n) ||
      /\b(nao faz(es)? nada|nao dizes nada|nada (te |me )?importa)\b/.test(n)) {
    found.push({ name: "absolute-extreme", label: "Generalização extrema", tensionWeight: 2, positiveWeight: 0 });
  }

  // --- Imperative / demands ---
  if (/\b(tens de|tens que|devias|devia|faz isto|para com|deixa de|para de|vai (la |)fazer|vai (la |)tratar)\b/.test(n)) {
    found.push({ name: "imperative", label: "Tom imperativo", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- Blame / accusation ---
  if (/\b(tu e que|a culpa e|por tua causa|por culpa tua|es tu que|foste tu|tu que|tu nunca|tu so)\b/.test(n)) {
    found.push({ name: "blame", label: "Linguagem de culpa", tensionWeight: 3, positiveWeight: 0 });
  }

  // --- Guilt-tripping ---
  if (/\b(depois de tudo|eu faco tudo|sacrifico|ninguem reconhece|faco tudo por|ninguem agradece|eu que faco|tudo o que eu fiz|depois do que fiz)\b/.test(n)) {
    found.push({ name: "guilt-trip", label: "Pode gerar culpa no outro", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- Emotional charge words (verbs, adjectives) ---
  const frustrationWords = n.match(/\b(irritad[oa]|frustrad[oa]|cansad[oa]|fart[oa]|exaust[oa]|saturad[oa]|esgotad[oa]|stressad[oa]|ansiosa?|nervos[oa]|chateado|chateada|magoado|magoada|desiludid[oa]|triste|zangad[oa]|revoltad[oa]|furioso|furiosa|incomodad[oa]|aflita?|assustada?)\b/g);
  if (frustrationWords && frustrationWords.length > 0) {
    found.push({
      name: "emotion-words",
      label: frustrationWords.length > 1 ? "Várias emoções negativas expressas" : `Emoção expressa: "${frustrationWords[0]}"`,
      tensionWeight: 1.5 + (frustrationWords.length - 1),
      positiveWeight: 0,
    });
  }

  // --- Threats / ultimatums ---
  if (/\b(ou entao|e a ultima vez|acaba aqui|nao te perdoo|acabou|chega|vou[- ]me embora|acabo com isto|nao ha volta)\b/.test(n)) {
    found.push({ name: "ultimatum", label: "Tom de ultimato", tensionWeight: 3.5, positiveWeight: 0 });
  }

  // --- Aggressive questioning ---
  if (/\b(porque e que (nunca|sempre|nao)|quando e que vais|porque (raio|carga d'agua))\b/.test(n)) {
    found.push({ name: "aggressive-question", label: "Pergunta acusatória", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- Sarcasm ---
  if (/\b(claro que sim|que surpresa|quem diria|incrivel como|como se|ai sim|uau|pois pois|sim claro|obrigad[oa] por nada|muito bonito|muito bem,? sim senhor|que grande|brilhante)\b/.test(n)) {
    found.push({ name: "sarcasm", label: "Pode soar sarcástico", tensionWeight: 2, positiveWeight: 0 });
  }

  // --- "Precisamos de falar" ---
  if (/\b(precisamos de falar|temos de falar|temos que falar|precisamos de conversar)\b/.test(n)) {
    found.push({ name: "talk-trigger", label: "\"Precisamos de falar\" gera ansiedade", tensionWeight: 2, positiveWeight: 0 });
  }

  // --- Controlling language ---
  if (/\b(nao podes|proibo|nao te deixo|nao vais|nao te atrevas|nao sais|nao falas)\b/.test(n)) {
    found.push({ name: "controlling", label: "Linguagem de controlo", tensionWeight: 3, positiveWeight: 0 });
  }

  // --- Dismissive ---
  if (/\b(nao interessa|nao quero saber|pouco me importa|nao me interessa|que se lixe|nao me importa|dane[- ]se|pleeevee|que se dane)\b/.test(n)) {
    found.push({ name: "dismissive", label: "Tom desdenhoso", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- Avoidance ---
  if (/\b(nao me apetece (falar|discutir)|nao quero falar (sobre|disto)|nao estou para isto|nao tenho (paciencia|pachorra)|nao me chateies)\b/.test(n)) {
    found.push({ name: "avoidance", label: "Evitamento — fecha a conversa", tensionWeight: 2, positiveWeight: 0 });
  }

  // --- Comparison / judgment ---
  if (/\b(toda a gente|as outras pessoas|os outros conseguem|qualquer pessoa|ninguem faz isto|so tu|so tu e que|ate .+ consegue)\b/.test(n)) {
    found.push({ name: "comparison", label: "Comparação — gera vergonha", tensionWeight: 2.5, positiveWeight: 0 });
  }

  // --- Indirect / loaded "questions" that are actually statements ---
  if (/\b(nao achas que|nao te parece que|sera que e (assim tao|muito) dificil|custa[- ]te (muito |)assim tanto)\b/.test(n)) {
    found.push({ name: "loaded-question", label: "Pergunta retórica com carga", tensionWeight: 2, positiveWeight: 0 });
  }

  // --- Second person focus ("tu") in negative context ---
  const tuCount = (n.match(/\btu\b/g) || []).length;
  const negativeContext = /\b(nao|nunca|so|mas)\b/.test(n);
  if (tuCount >= 2 && negativeContext && !found.some(f => f.name === "blame")) {
    found.push({ name: "tu-focus", label: "Foco no \"tu\" — pode soar como ataque", tensionWeight: 1.5, positiveWeight: 0 });
  }

  // ============================================================
  // FORMATTING PATTERNS
  // ============================================================

  // ALL CAPS (shouting)
  if (original === original.toUpperCase() && original.length > 5 && /[A-Z]/.test(original)) {
    found.push({ name: "shouting", label: "MAIÚSCULAS = gritar em texto", tensionWeight: 3, positiveWeight: 0 });
  }

  // Partial caps (emphasis or anger)
  const capsWords = original.split(/\s+/).filter(w => w === w.toUpperCase() && w.length > 2 && /[A-Z]/.test(w));
  if (capsWords.length >= 2 && !found.some(f => f.name === "shouting")) {
    found.push({ name: "partial-caps", label: "Palavras em maiúsculas transmitem intensidade", tensionWeight: 1.5, positiveWeight: 0 });
  }

  // Excessive punctuation
  if (/[!?]{3,}/.test(original)) {
    found.push({ name: "excess-punctuation", label: "Pontuação excessiva aumenta intensidade", tensionWeight: 2, positiveWeight: 0 });
  } else if (/[!?]{2}/.test(original)) {
    found.push({ name: "double-punctuation", label: "Pontuação dupla transmite urgência", tensionWeight: 1, positiveWeight: 0 });
  }

  // Ellipsis with emotional context ("..." can be passive or ominous)
  if (/\.{3,}/.test(original) && found.some(f => f.tensionWeight > 0)) {
    found.push({ name: "ellipsis", label: "Reticências amplificam a carga emocional", tensionWeight: 0.5, positiveWeight: 0 });
  }

  // ============================================================
  // POSITIVE PATTERNS
  // ============================================================

  // Gratitude
  if (/\b(obrigad[oa]|agradeco|muito obrigad[oa]|obrigadissim[oa])\b/.test(n)) {
    found.push({ name: "gratitude", label: "Gratidão", tensionWeight: 0, positiveWeight: 3 });
  }

  // Love / affection
  if (/\b(amo[- ]te|adoro[- ]te|amo|adoro|querido|querida|amor|meu amor|minha vida|meu bem|gosto (muito )?de ti|es especial)\b/.test(n)) {
    found.push({ name: "love", label: "Carinho e afecto", tensionWeight: 0, positiveWeight: 3 });
  }

  // Encouragement / support
  if (/\b(parabens|orgulho|incrivel|fantastico|maravilhos[oa]|muito bem|bom trabalho|estou contigo|conto contigo|acredito em ti|vais conseguir|es capaz)\b/.test(n)) {
    found.push({ name: "encouragement", label: "Encorajamento", tensionWeight: 0, positiveWeight: 2.5 });
  }

  // Empathy / vulnerability
  if (/\b(compreendo|entendo|percebo como|sei que e dificil|estou aqui para|podes contar comigo|desculpa|perdao|lamento|sei como te sentes)\b/.test(n)) {
    found.push({ name: "empathy", label: "Empatia e vulnerabilidade", tensionWeight: 0, positiveWeight: 2.5 });
  }

  // Warmth / friendly
  if (/\b(saudade[s]?|como estas|tudo bem contigo|gosto de|feliz|contente|alegri[ae]|que bom|ainda bem|fico feliz|beijinho|beijo|abraco)\b/.test(n)) {
    found.push({ name: "warmth", label: "Tom acolhedor", tensionWeight: 0, positiveWeight: 2 });
  }

  // Invitation / openness
  if (/\b(o que achas|queres|gostavas de|podemos|vamos|quando puderes|quando quiseres|se quiseres|diz[- ]me o que pensas|o que preferes)\b/.test(n)) {
    found.push({ name: "invitation", label: "Convite aberto", tensionWeight: 0, positiveWeight: 1.5 });
  }

  return found;
}

// --- Tone Classification ---

function classifyTone(tension: number, positiveScore: number, patterns: PatternMatch[]): string {
  const names = new Set(patterns.map(p => p.name));

  // High-specificity patterns first
  if (names.has("passive-aggressive") || names.has("self-blame-passive")) return "passivo-agressivo";
  if (names.has("ultimatum")) return "ultimato";
  if (names.has("blame")) return "acusatório";
  if (names.has("guilt-trip")) return "manipulação emocional";
  if (names.has("sarcasm")) return "sarcástico";
  if (names.has("controlling")) return "controlador";
  if (names.has("dismissive")) return "desdenhoso";
  if (names.has("shouting")) return "agressivo";
  if (names.has("comparison")) return "crítico por comparação";
  if (names.has("avoidance")) return "evitante";

  // Medium specificity
  if (names.has("resigned")) return "resignado ou exausto";
  if (names.has("forced-apology")) return "desculpa forçada";
  if (names.has("accusation-lite")) return "subtilmente acusatório";
  if (names.has("repetition-frustration")) return "frustração com repetição";
  if (names.has("edge-question")) return "defensivo";
  if (names.has("terse")) return "seco e distante";
  if (names.has("loaded-question")) return "crítica disfarçada de pergunta";
  if (names.has("tu-focus")) return "focado no outro — pode soar como ataque";

  // Tension-based fallback
  if (tension > 7) return "muito tenso";
  if (tension > 5) return "tenso";
  if (tension > 3) return "ligeiramente tenso";
  if (tension > 1.5) return "com alguma carga";

  // Positive
  if (names.has("love")) return "carinhoso e amoroso";
  if (names.has("empathy")) return "empático e acolhedor";
  if (names.has("gratitude")) return "agradecido";
  if (names.has("encouragement")) return "encorajador";
  if (names.has("warmth")) return "amigável e caloroso";
  if (names.has("invitation")) return "aberto e convidativo";

  if (positiveScore > 3) return "positivo e claro";
  if (positiveScore > 1) return "amigável";

  return "neutro e claro";
}

// --- Smart Rewrite ---

function generateRewrite(message: string, tension: number, patterns: PatternMatch[]): string | null {
  if (tension <= 2) return null;

  const names = new Set(patterns.map(p => p.name));
  let rewrite = message;

  // Absolute language softeners
  rewrite = rewrite.replace(/\bsempre\b/gi, "muitas vezes");
  rewrite = rewrite.replace(/\bnunca\b/gi, "raramente");

  // Imperative softeners
  rewrite = rewrite.replace(/\btens de\b/gi, "seria bom se pudesses");
  rewrite = rewrite.replace(/\btens que\b/gi, "seria bom se pudesses");
  rewrite = rewrite.replace(/\bdevias\b/gi, "talvez possas considerar");
  rewrite = rewrite.replace(/\bdevia\b/gi, "talvez pudesse");
  rewrite = rewrite.replace(/\bpara com\b/gi, "preferia que não");
  rewrite = rewrite.replace(/\bdeixa de\b/gi, "preferia que não");
  rewrite = rewrite.replace(/\bpara de\b/gi, "preferia que não");

  // Terse rewrites
  if (names.has("terse")) {
    const terseMap: Record<string, string> = {
      "ok": "Ok, compreendo.",
      "ok.": "Ok, compreendo.",
      "pois": "Percebo o que dizes.",
      "pois.": "Percebo o que dizes.",
      "sim sim": "Sim, compreendo.",
      "sim": "Sim, faz sentido.",
      "certo": "Certo, percebi.",
      "certo.": "Certo, percebi.",
      "já percebi": "Percebi, obrigado/a por explicares.",
      "já percebi.": "Percebi, obrigado/a por explicares.",
      "já vi": "Já vi, obrigado/a.",
      "já vi.": "Já vi, obrigado/a.",
      "pronto": "Está bem, compreendo.",
      "pronto.": "Está bem, compreendo.",
      "tá": "Ok, percebi.",
      "tá bem": "Está bem, percebi.",
      "tá bem.": "Está bem, percebi.",
      "está bem": "Está bem, obrigado/a.",
      "está bem.": "Está bem, obrigado/a.",
      "percebi": "Percebi, obrigado/a.",
      "percebi.": "Percebi, obrigado/a.",
    };
    const key = message.toLowerCase().trim();
    if (terseMap[key]) {
      rewrite = terseMap[key];
    }
  }

  // Passive-aggressive rewrites
  if (names.has("passive-aggressive")) {
    rewrite = rewrite.replace(/\bfaz como quiseres\b/gi, "gostava de encontrar uma solução juntos");
    rewrite = rewrite.replace(/\bfaz o que (tu )?quiseres\b/gi, "gostava de decidir isto juntos");
    rewrite = rewrite.replace(/\bcomo queiras\b/gi, "o que achas que seria melhor?");
    rewrite = rewrite.replace(/\btanto faz\b/gi, "não tenho uma preferência forte, e tu?");
    rewrite = rewrite.replace(/\bnão é nada\b/gi, "há algo que me está a incomodar");
    rewrite = rewrite.replace(/\besquece\b/gi, "quero falar sobre isto, mas talvez noutra altura");
    rewrite = rewrite.replace(/\bdeixa estar\b/gi, "prefiro conversar sobre isto quando estivermos calmos");
    rewrite = rewrite.replace(/\bse é isso que queres\b/gi, "quero perceber melhor o que preferes");
    rewrite = rewrite.replace(/\bse tu dizes\b/gi, "confio no que me dizes, mas gostava de perceber melhor");
  }

  // Blame rewrites
  if (names.has("blame")) {
    rewrite = rewrite.replace(/\btu é que\b/gi, "sinto que");
    rewrite = rewrite.replace(/\ba culpa é tua\b/gi, "sinto-me frustrado/a com esta situação");
    rewrite = rewrite.replace(/\bpor tua causa\b/gi, "quando isto acontece, eu sinto");
    rewrite = rewrite.replace(/\bfoste tu\b/gi, "senti que");
    rewrite = rewrite.replace(/\btu nunca\b/gi, "sinto que raramente");
    rewrite = rewrite.replace(/\btu só\b/gi, "sinto que muitas vezes");
  }

  // "Precisamos de falar" softener
  if (names.has("talk-trigger")) {
    rewrite = rewrite.replace(/\bprecisamos de falar\b/gi, "gostava de conversar contigo quando tiveres disponibilidade");
    rewrite = rewrite.replace(/\btemos de falar\b/gi, "gostava de conversar contigo quando tiveres um momento");
    rewrite = rewrite.replace(/\btemos que falar\b/gi, "gostava de conversar contigo quando puderes");
    rewrite = rewrite.replace(/\bprecisamos de conversar\b/gi, "gostava de conversar contigo sobre algo");
  }

  // Guilt-trip rewrites
  if (names.has("guilt-trip")) {
    rewrite = rewrite.replace(/\bdepois de tudo o que\b/gi, "valorizo o que");
    rewrite = rewrite.replace(/\beu faço tudo\b/gi, "sinto que tenho feito muito");
    rewrite = rewrite.replace(/\bninguém reconhece\b/gi, "gostava de me sentir mais reconhecido/a");
    rewrite = rewrite.replace(/\bninguém agradece\b/gi, "gostava de sentir mais reconhecimento");
  }

  // Repetition frustration
  if (names.has("repetition-frustration")) {
    rewrite = rewrite.replace(/\boutra vez\b/gi, "novamente");
    rewrite = rewrite.replace(/\bmais uma vez\b/gi, "mais uma vez — e isso frustra-me");
    rewrite = rewrite.replace(/\bjá te disse\b/gi, "como já tínhamos falado");
    rewrite = rewrite.replace(/\bquantas vezes\b/gi, "sinto que já conversámos sobre isto várias vezes");
  }

  // Edge question
  if (names.has("edge-question")) {
    rewrite = rewrite.replace(/\ba sério\??/gi, "estou a tentar perceber —");
    rewrite = rewrite.replace(/\bque queres que te diga\b/gi, "não sei bem o que te dizer, mas quero ser honesto/a");
    rewrite = rewrite.replace(/\bo que queres que (eu )?faça\b/gi, "o que achas que podemos fazer juntos?");
  }

  // Accusation-lite
  if (names.has("accusation-lite")) {
    rewrite = rewrite.replace(/\blá estás tu\b/gi, "quando isto acontece, sinto que");
    rewrite = rewrite.replace(/\bcomo sempre\b/gi, "como tem acontecido");
    rewrite = rewrite.replace(/\bcomo de costume\b/gi, "como tem sido habitual");
    rewrite = rewrite.replace(/\btípico\b/gi, "sinto que isto se repete");
  }

  // Self-blame passive
  if (names.has("self-blame-passive")) {
    rewrite = rewrite.replace(/\bse calhar sou eu\b/gi, "se calhar precisamos de perceber isto juntos");
    rewrite = rewrite.replace(/\bo problema sou eu\b/gi, "sinto-me parte do problema, mas gostava de resolver");
  }

  // Forced apology
  if (names.has("forced-apology")) {
    rewrite = rewrite.replace(/\bpronto,? desculpa\b/gi, "peço desculpa — percebo que te magoei");
    rewrite = rewrite.replace(/\bdesculpa lá\b/gi, "peço-te desculpa sinceramente");
  }

  // Remove excessive punctuation
  rewrite = rewrite.replace(/!{2,}/g, ".");
  rewrite = rewrite.replace(/\?{2,}/g, "?");

  // If ALL CAPS, convert to normal case
  if (names.has("shouting")) {
    rewrite = rewrite.charAt(0).toUpperCase() + rewrite.slice(1).toLowerCase();
  }

  return rewrite !== message ? rewrite : null;
}

// --- Suggestion Generator ---

function generateSuggestion(tension: number, patterns: PatternMatch[]): string | null {
  const names = new Set(patterns.map(p => p.name));

  if (names.has("terse")) {
    return "Respostas secas podem parecer distantes ou zangadas. Uma ou duas palavras extra mudam a forma como o outro recebe a mensagem.";
  }

  if (names.has("passive-aggressive")) {
    return "Esta mensagem esconde o que realmente sentes. Experimenta expressar directamente a tua frustração — é mais vulnerável, mas cria mais ligação.";
  }

  if (names.has("self-blame-passive")) {
    return "Auto-culpar-te de forma forçada gera culpa no outro em vez de empatia. Se realmente achas que contribuíste, diz-o sem dramatizar.";
  }

  if (names.has("ultimatum")) {
    return "O tom de ultimato fecha portas ao diálogo. Se estás a chegar ao limite, expressa o que sentes sem ameaçar — o impacto é maior.";
  }

  if (names.has("blame")) {
    return "A linguagem de culpa activa a defensividade do outro. Experimenta trocar \"tu\" por \"eu sinto\" — a mensagem chega sem que o outro precise de se defender.";
  }

  if (names.has("guilt-trip")) {
    return "Esta mensagem pode gerar culpa em vez de empatia. Expressa o que precisas directamente, sem referir o que já fizeste — é mais poderoso.";
  }

  if (names.has("sarcasm")) {
    return "O sarcasmo em texto é arriscado — sem tom de voz, é quase sempre interpretado como ataque. Diz o que sentes directamente.";
  }

  if (names.has("controlling")) {
    return "Linguagem de controlo afasta, não aproxima. Experimenta expressar o que precisas sem decidir pelo outro.";
  }

  if (names.has("dismissive")) {
    return "Desvalorizar a conversa magoa mais do que discordar. Se precisas de espaço, diz isso directamente.";
  }

  if (names.has("talk-trigger")) {
    return "\"Precisamos de falar\" é das frases que mais gera ansiedade. Adiciona contexto e um tom aberto para não criar pânico.";
  }

  if (names.has("shouting")) {
    return "MAIÚSCULAS em texto = gritar. Mesmo que não seja a tua intenção, é assim que vai ser lido.";
  }

  if (names.has("aggressive-question")) {
    return "As perguntas que começam com \"porquê\" podem soar como acusação. Experimenta reformular como pedido.";
  }

  if (names.has("repetition-frustration")) {
    return "A frustração de repetir é válida. Mas frases como \"outra vez\" ou \"já te disse\" fazem o outro sentir-se incompetente. Foca no que precisas, não no que falhou.";
  }

  if (names.has("edge-question")) {
    return "Perguntas como \"a sério?\" ou \"e depois?\" transmitem julgamento. Se queres uma resposta real, reformula com curiosidade genuína.";
  }

  if (names.has("resigned")) {
    return "Quando alguém sente que o outro desistiu, gera pânico ou distância. Se estás exausto/a, diz isso — \"estou cansado/a\" é diferente de \"desisto\".";
  }

  if (names.has("accusation-lite")) {
    return "Frases como \"lá estás tu\" ou \"como sempre\" são acusações disfarçadas. Expressam frustração, mas o outro só ouve ataque.";
  }

  if (names.has("forced-apology")) {
    return "Um \"desculpa\" forçado transmite o oposto — mostra que não estás realmente arrependido/a. Se não estás pronto/a para pedir desculpa, não peças ainda.";
  }

  if (names.has("subtle-dismissal")) {
    return "\"Não te preocupes\" ou \"Eu sei\" podem minimizar algo que importa ao outro. Confirma que ouviste antes de tranquilizar.";
  }

  if (names.has("avoidance")) {
    return "Evitar a conversa resolve a curto prazo, mas acumula tensão. Se não é o momento, marca uma altura — \"podemos falar amanhã?\"";
  }

  if (names.has("comparison")) {
    return "Comparar com outros gera vergonha, não motivação. Foca no que precisas, não no que outros conseguem.";
  }

  if (names.has("loaded-question")) {
    return "Perguntas retóricas como \"custa assim tanto?\" são críticas disfarçadas. Diz directamente o que te frustra.";
  }

  if (names.has("tu-focus")) {
    return "Quando uma mensagem repete \"tu\" várias vezes num contexto negativo, parece um ataque. Troca para linguagem em \"eu\" para expressar o mesmo sem acusar.";
  }

  if (names.has("cold-short")) {
    return "Respostas curtas com ponto final podem parecer frias. Se é intencional, tudo bem. Se não, adiciona um pouco mais.";
  }

  if (names.has("emotion-words")) {
    return "Expressar emoções é saudável. Atenção apenas ao tom geral — emoções nomeadas são mais claras do que emoções demonstradas.";
  }

  if (tension > 5) {
    return "Esta mensagem pode soar mais intensa do que pretendes. Experimenta suavizar o tom antes de enviar.";
  }

  if (tension > 2) {
    return "O tom tem alguma carga. Uma pequena suavização pode mudar a forma como o outro recebe a mensagem.";
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

  // Positive patterns reduce tension (but don't eliminate it)
  tension = Math.max(0, tension - positiveScore * 0.3);
  tension = Math.min(10, Math.round(tension * 10) / 10);

  const sentiment: EmotionalAnalysis["sentiment"] =
    positiveScore > 3 && tension < 2
      ? "positivo"
      : tension > 4
        ? "negativo"
        : tension > 1.5 && positiveScore > 1
          ? "misto"
          : positiveScore > 1 && tension <= 1.5
            ? "positivo"
            : tension > 1
              ? "negativo"
              : "neutro";

  const intensity: EmotionalAnalysis["intensity"] =
    tension > 5 ? "alta" : tension > 2 ? "média" : "baixa";

  const tone = classifyTone(tension, positiveScore, patterns);
  const suggestion = generateSuggestion(tension, patterns);
  const rewrite = generateRewrite(message, tension, patterns);

  return {
    tone,
    intensity,
    sentiment,
    tension: Math.round(tension),
    suggestion,
    rewrite,
    patterns: patterns.map(p => p.label),
  };
}

export { SYSTEM_PROMPT };
