export interface EmotionalAnalysis {
  tone: string;
  intensity: "baixa" | "média" | "alta";
  sentiment: "positivo" | "neutro" | "negativo" | "misto";
  tension: number; // 0-10
  suggestion: string | null;
  rewrite: string | null;
  patterns: string[];
  // --- NEW: the real product ---
  subtext: string | null; // What the message really communicates
  receiverPerspective: string | null; // How the other person will feel
  insight: string | null; // The deep observation — the "wow" moment
}

const SYSTEM_PROMPT = `Tu és o motor de inteligência relacional do Linqo.`;

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
  // TENSION PATTERNS
  // ============================================================

  const tersePatterns = /^(ok|esta bem|pois|sim sim|sim|certo|ja percebi|ja vi|pronto|hmm|hm|ta|ta bem|ya|k|percebi)\.?$/;
  if (tersePatterns.test(n.trim())) {
    found.push({ name: "terse", label: "Resposta seca", tensionWeight: 2, positiveWeight: 0 });
  }

  if (!found.some(f => f.name === "terse") && original.length < 20 && original.endsWith(".") && wordCount <= 4 && !/\b(obrigad|amo|gosto|adoro|beijinho|beijo)\b/.test(n)) {
    found.push({ name: "cold-short", label: "Resposta curta e fria", tensionWeight: 1.5, positiveWeight: 0 });
  }

  if (/\b(ja percebi|eu sei|nao e preciso|nao te preocupes|deixa la|nao faz mal|esta tudo bem|nao ha problema)\b/.test(n) && wordCount < 8) {
    if (!found.some(f => f.name === "terse")) {
      found.push({ name: "subtle-dismissal", label: "Minimização subtil", tensionWeight: 1.5, positiveWeight: 0 });
    }
  }

  if (/\b(outra vez|mais uma vez|ja te disse|quantas vezes|sempre a mesma|mesma coisa|a mesma historia|de novo|ja falamos sobre|ja discutimos|nao e a primeira vez)\b/.test(n)) {
    found.push({ name: "repetition-frustration", label: "Frustração com repetição", tensionWeight: 2.5, positiveWeight: 0 });
  }

  if (/\b(a serio\??|e depois\??|e entao\??|o que e que queres|que queres que (eu |te )?fa[cç]a|que queres que te diga|o que esperas|o que queres de mim)\b/.test(n)) {
    found.push({ name: "edge-question", label: "Pergunta com carga", tensionWeight: 2, positiveWeight: 0 });
  }

  if (/\b(nao sei para que|ja nao sei|nao sei o que fazer|ja nao aguento|ja nao consigo|nao sei mais|para que e que|desisto|nao sei que mais|nao adianta|sem sentido)\b/.test(n)) {
    found.push({ name: "resigned", label: "Tom de desistência", tensionWeight: 2.5, positiveWeight: 0 });
  }

  if (/\b(la estas tu|la vens tu|es sempre assim|mais uma das tuas|tipico|como de costume|como sempre|nao me surpreende)\b/.test(n)) {
    found.push({ name: "accusation-lite", label: "Acusação subtil", tensionWeight: 2.5, positiveWeight: 0 });
  }

  if (/\b(faz como quiseres|como queiras|tanto faz|faz o que (tu )?quiseres|fica a vontade|se achas que sim|se tu dizes|se e isso que achas|se e isso que queres)\b/.test(n) ||
      /\b(nao e nada|esquece|deixa estar|nao vale a pena|esquece o que disse|nao me oicas|nao ligues)\b/.test(n)) {
    if (!found.some(f => f.name === "terse")) {
      found.push({ name: "passive-aggressive", label: "Passivo-agressivo", tensionWeight: 3, positiveWeight: 0 });
    }
  }

  if (/\b(pronto,? desculpa|desculpa la|ta bem,? desculpa|pronto ja pedi desculpa|peco imensa desculpa)\b/.test(n)) {
    found.push({ name: "forced-apology", label: "Desculpa forçada", tensionWeight: 2, positiveWeight: 0 });
  }

  if (/\b(se calhar sou eu|a culpa (deve ser|e) minha|eu e que sou parv|eu e que estou mal|o problema sou eu|se calhar o problema sou eu)\b/.test(n)) {
    found.push({ name: "self-blame-passive", label: "Auto-culpa passiva", tensionWeight: 2.5, positiveWeight: 0 });
  }

  const absoluteWords = (n.match(/\b(sempre|nunca)\b/g) || []).length;
  if (absoluteWords > 0) {
    const positiveAbsolute = /\b(amo[- ]te sempre|adoro[- ]te sempre|sempre te amei|gosto sempre)\b/.test(n);
    if (!positiveAbsolute) {
      found.push({ name: "absolute", label: "Linguagem absoluta", tensionWeight: 1.5 * absoluteWords, positiveWeight: 0 });
    }
  }

  if (/\b(nada (me |do que |que ))|(\btudo (errado|mal)\b)/.test(n) ||
      /\b(nao faz(es)? nada|nao dizes nada|nada (te |me )?importa)\b/.test(n)) {
    found.push({ name: "absolute-extreme", label: "Generalização extrema", tensionWeight: 2, positiveWeight: 0 });
  }

  if (/\b(tens de|tens que|devias|devia|faz isto|para com|deixa de|para de|vai (la |)fazer|vai (la |)tratar)\b/.test(n)) {
    found.push({ name: "imperative", label: "Tom imperativo", tensionWeight: 2.5, positiveWeight: 0 });
  }

  if (/\b(tu e que|a culpa e|por tua causa|por culpa tua|es tu que|foste tu|tu que|tu nunca|tu so)\b/.test(n)) {
    found.push({ name: "blame", label: "Linguagem de culpa", tensionWeight: 3, positiveWeight: 0 });
  }

  if (/\b(depois de tudo|eu faco tudo|sacrifico|ninguem reconhece|faco tudo por|ninguem agradece|eu que faco|tudo o que eu fiz|depois do que fiz)\b/.test(n)) {
    found.push({ name: "guilt-trip", label: "Culpabilização", tensionWeight: 2.5, positiveWeight: 0 });
  }

  const frustrationWords = n.match(/\b(irritad[oa]|frustrad[oa]|cansad[oa]|fart[oa]|exaust[oa]|saturad[oa]|esgotad[oa]|stressad[oa]|ansiosa?|nervos[oa]|chateado|chateada|magoado|magoada|desiludid[oa]|triste|zangad[oa]|revoltad[oa]|furioso|furiosa|incomodad[oa]|aflita?|assustada?)\b/g);
  if (frustrationWords && frustrationWords.length > 0) {
    found.push({
      name: "emotion-words",
      label: `Emoção: ${frustrationWords[0]}`,
      tensionWeight: 1.5 + (frustrationWords.length - 1),
      positiveWeight: 0,
    });
  }

  if (/\b(ou entao|e a ultima vez|acaba aqui|nao te perdoo|acabou|chega|vou[- ]me embora|acabo com isto|nao ha volta)\b/.test(n)) {
    found.push({ name: "ultimatum", label: "Ultimato", tensionWeight: 3.5, positiveWeight: 0 });
  }

  if (/\b(porque e que (nunca|sempre|nao)|quando e que vais|porque (raio|carga d'agua))\b/.test(n)) {
    found.push({ name: "aggressive-question", label: "Pergunta acusatória", tensionWeight: 2.5, positiveWeight: 0 });
  }

  if (/\b(claro que sim|que surpresa|quem diria|incrivel como|ai sim|uau|pois pois|sim claro|obrigad[oa] por nada|muito bonito|muito bem,? sim senhor|que grande|brilhante)\b/.test(n)) {
    found.push({ name: "sarcasm", label: "Sarcasmo", tensionWeight: 2, positiveWeight: 0 });
  }

  if (/\b(precisamos de falar|temos de falar|temos que falar|precisamos de conversar)\b/.test(n)) {
    found.push({ name: "talk-trigger", label: "Gatilho de ansiedade", tensionWeight: 2, positiveWeight: 0 });
  }

  if (/\b(nao podes|proibo|nao te deixo|nao vais|nao te atrevas|nao sais|nao falas)\b/.test(n)) {
    found.push({ name: "controlling", label: "Controlo", tensionWeight: 3, positiveWeight: 0 });
  }

  if (/\b(nao interessa|nao quero saber|pouco me importa|nao me interessa|que se lixe|nao me importa|dane[- ]se|que se dane)\b/.test(n)) {
    found.push({ name: "dismissive", label: "Desdém", tensionWeight: 2.5, positiveWeight: 0 });
  }

  if (/\b(nao me apetece (falar|discutir)|nao quero falar (sobre|disto)|nao estou para isto|nao tenho (paciencia|pachorra)|nao me chateies)\b/.test(n)) {
    found.push({ name: "avoidance", label: "Evitamento", tensionWeight: 2, positiveWeight: 0 });
  }

  if (/\b(toda a gente|as outras pessoas|os outros conseguem|qualquer pessoa|ninguem faz isto|so tu|so tu e que|ate .+ consegue)\b/.test(n)) {
    found.push({ name: "comparison", label: "Comparação", tensionWeight: 2.5, positiveWeight: 0 });
  }

  if (/\b(nao achas que|nao te parece que|sera que e (assim tao|muito) dificil|custa[- ]te (muito |)assim tanto)\b/.test(n)) {
    found.push({ name: "loaded-question", label: "Pergunta retórica", tensionWeight: 2, positiveWeight: 0 });
  }

  const tuCount = (n.match(/\btu\b/g) || []).length;
  const negativeContext = /\b(nao|nunca|so|mas)\b/.test(n);
  if (tuCount >= 2 && negativeContext && !found.some(f => f.name === "blame")) {
    found.push({ name: "tu-focus", label: "Foco no \"tu\"", tensionWeight: 1.5, positiveWeight: 0 });
  }

  // ============================================================
  // FORMATTING
  // ============================================================

  if (original === original.toUpperCase() && original.length > 5 && /[A-Z]/.test(original)) {
    found.push({ name: "shouting", label: "Maiúsculas", tensionWeight: 3, positiveWeight: 0 });
  }

  const capsWords = original.split(/\s+/).filter(w => w === w.toUpperCase() && w.length > 2 && /[A-Z]/.test(w));
  if (capsWords.length >= 2 && !found.some(f => f.name === "shouting")) {
    found.push({ name: "partial-caps", label: "Palavras em maiúsculas", tensionWeight: 1.5, positiveWeight: 0 });
  }

  if (/[!?]{3,}/.test(original)) {
    found.push({ name: "excess-punctuation", label: "Pontuação excessiva", tensionWeight: 2, positiveWeight: 0 });
  } else if (/[!?]{2}/.test(original)) {
    found.push({ name: "double-punctuation", label: "Pontuação dupla", tensionWeight: 1, positiveWeight: 0 });
  }

  if (/\.{3,}/.test(original) && found.some(f => f.tensionWeight > 0)) {
    found.push({ name: "ellipsis", label: "Reticências", tensionWeight: 0.5, positiveWeight: 0 });
  }

  // ============================================================
  // POSITIVE
  // ============================================================

  if (/\b(obrigad[oa]|agradeco|muito obrigad[oa]|obrigadissim[oa])\b/.test(n)) {
    found.push({ name: "gratitude", label: "Gratidão", tensionWeight: 0, positiveWeight: 3 });
  }

  if (/\b(amo[- ]te|adoro[- ]te|amo|adoro|querido|querida|amor|meu amor|minha vida|meu bem|gosto (muito )?de ti|es especial)\b/.test(n)) {
    found.push({ name: "love", label: "Carinho", tensionWeight: 0, positiveWeight: 3 });
  }

  if (/\b(parabens|orgulho|incrivel|fantastico|maravilhos[oa]|muito bem|bom trabalho|estou contigo|conto contigo|acredito em ti|vais conseguir|es capaz)\b/.test(n)) {
    found.push({ name: "encouragement", label: "Encorajamento", tensionWeight: 0, positiveWeight: 2.5 });
  }

  if (/\b(compreendo|entendo|percebo como|sei que e dificil|estou aqui para|podes contar comigo|desculpa|perdao|lamento|sei como te sentes)\b/.test(n)) {
    found.push({ name: "empathy", label: "Empatia", tensionWeight: 0, positiveWeight: 2.5 });
  }

  if (/\b(saudade[s]?|como estas|tudo bem contigo|gosto de|feliz|contente|alegri[ae]|que bom|ainda bem|fico feliz|beijinho|beijo|abraco)\b/.test(n)) {
    found.push({ name: "warmth", label: "Caloroso", tensionWeight: 0, positiveWeight: 2 });
  }

  if (/\b(o que achas|gostavas de|podemos|quando puderes|quando quiseres|se quiseres|diz[- ]me o que pensas|o que preferes)\b/.test(n)) {
    found.push({ name: "invitation", label: "Convite aberto", tensionWeight: 0, positiveWeight: 1.5 });
  }

  return found;
}

// ============================================================
// SUBTEXT — "O que dizes vs. o que o outro ouve"
// ============================================================

function generateSubtext(message: string, patterns: PatternMatch[]): string | null {
  const names = new Set(patterns.map(p => p.name));
  const n = normalize(message);

  // Terse — specific subtexts per response
  if (names.has("terse")) {
    const trimmed = n.trim().replace(/\.$/, "");
    const terseSubtexts: Record<string, string> = {
      "ok": "\"Ouvi, mas não estou disponível para esta conversa. Não me perguntes porquê.\"",
      "pois": "\"Ouvi. Não concordo. Mas não vou dizer-te o que penso.\"",
      "sim sim": "\"Estou a concordar para acabar com a conversa, não porque realmente concorde.\"",
      "sim": "\"Sim. Ponto. Não esperes mais de mim agora.\"",
      "certo": "\"Recebi a informação. Não esperes entusiasmo.\"",
      "ja percebi": "\"Chega. Não preciso de mais explicações.\"",
      "ja vi": "\"Já vi. Não estou impressionado/a.\"",
      "pronto": "\"Acabou-se. Não quero continuar a discutir.\"",
      "ta": "\"Registei. Não me apetece elaborar.\"",
      "ta bem": "\"Aceito, mas sem vontade.\"",
      "esta bem": "\"Ok, mas quero que saibas que não estou contente com isto.\"",
      "percebi": "\"Percebi. Para de explicar.\"",
      "hmm": "\"Estou a processar, mas algo não me convence.\"",
      "hm": "\"Algo não bate certo, mas não vou dizer o quê.\"",
    };
    if (terseSubtexts[trimmed]) return terseSubtexts[trimmed];
    return "\"Estou aqui, mas emocionalmente já saí da conversa.\"";
  }

  // Passive-aggressive — specific subtexts
  if (names.has("passive-aggressive")) {
    if (/faz como quiseres|faz o que/.test(n)) return "\"Não concordo, mas se insistires, depois não venhas pedir ajuda.\"";
    if (/tanto faz/.test(n)) return "\"Importa-me, mas se te digo que sim, perco; se digo que não, perco. Por isso finjo que não me importa.\"";
    if (/esquece|deixa estar/.test(n)) return "\"Não vou esquecer. Mas já percebi que não vale a pena falar contigo sobre isto.\"";
    if (/nao e nada/.test(n)) return "\"É alguma coisa, sim. Mas não me sinto seguro/a para te dizer o quê.\"";
    if (/se tu dizes|se achas/.test(n)) return "\"Não acredito no que estás a dizer, mas não tenho energia para discutir.\"";
    if (/nao vale a pena/.test(n)) return "\"Já tentei, já falhei. Desisti de ser ouvido/a.\"";
    return "\"Há algo que não te estou a dizer. E essa omissão é a própria mensagem.\"";
  }

  // Self-blame passive
  if (names.has("self-blame-passive")) {
    return "\"Estou a culpar-me para que sejas tu a dizer que não é culpa minha. É um pedido de validação disfarçado de auto-crítica.\"";
  }

  // Forced apology
  if (names.has("forced-apology")) {
    return "\"Estou a pedir desculpa para acabar com a conversa, não porque realmente lamente o que fiz.\"";
  }

  // Blame
  if (names.has("blame")) {
    if (names.has("absolute")) {
      return "\"Estou tão frustrado/a que só consigo ver o que tu fazes de errado. Se fosse mais honesto/a, diria que me sinto sozinho/a nisto.\"";
    }
    return "\"Sinto-me magoado/a, mas em vez de mostrar a ferida, mostro o dedo que aponta para ti.\"";
  }

  // Guilt-trip
  if (names.has("guilt-trip")) {
    return "\"Quero que saibas quanto sacrifiquei. Não para te informar — para que sintas que me deves algo.\"";
  }

  // Ultimatum
  if (names.has("ultimatum")) {
    return "\"Estou a ameaçar porque me sinto sem poder. Se tivesse outra forma de ser ouvido/a, não precisava de ultimatos.\"";
  }

  // Sarcasm
  if (names.has("sarcasm")) {
    return "\"Estou a usar ironia para expressar algo que me magoa. É mais fácil ser irónico/a do que vulnerável.\"";
  }

  // Resigned
  if (names.has("resigned")) {
    return "\"Estou a dizer que desisto, mas na verdade estou a pedir que alguém me dê uma razão para não desistir.\"";
  }

  // Accusation-lite
  if (names.has("accusation-lite")) {
    if (/la estas tu|la vens tu/.test(n)) return "\"Estou a catalogar-te. Em vez de falar sobre esta situação específica, estou a dizer-te que és assim — sempre.\"";
    if (/tipico|como de costume|como sempre/.test(n)) return "\"Já não me surpreendo. E o facto de já não me surpreender é, em si, uma acusação.\"";
    return "\"Não estou a falar desta situação. Estou a falar de um padrão — e a dizer-te que não acredito que mudes.\"";
  }

  // Repetition frustration
  if (names.has("repetition-frustration")) {
    return "\"Sinto que não fui ouvido/a antes. E a frustração de repetir é maior do que o problema em si.\"";
  }

  // Edge question
  if (names.has("edge-question")) {
    if (/a serio/.test(n)) return "\"Não estou a pedir confirmação. Estou a expressar choque ou desilusão.\"";
    if (/que queres que/.test(n)) return "\"Sinto-me encurralado/a. Não sei o que esperas de mim e isso frustra-me.\"";
    return "\"Esta pergunta não quer uma resposta. Quer que sintas o que eu estou a sentir.\"";
  }

  // Talk trigger
  if (names.has("talk-trigger")) {
    return "\"Para ti é um pedido de conversa. Para o outro, é o início de uma espiral de ansiedade — 'O que fiz? O que aconteceu?'\"";
  }

  // Controlling
  if (names.has("controlling")) {
    return "\"Estou a tentar controlar o que fazes porque não consigo controlar o que sinto. É medo disfarçado de autoridade.\"";
  }

  // Dismissive
  if (names.has("dismissive")) {
    return "\"Não é que não me importe. É que a dor de me importar é tão grande que finjo que não.\"";
  }

  // Avoidance
  if (names.has("avoidance")) {
    return "\"Não é que não queira falar. É que tenho medo do que vai acontecer se falar.\"";
  }

  // Comparison
  if (names.has("comparison")) {
    return "\"Estou a comparar-te com outros para te fazer sentir que não chegas. Mas o que realmente quero é que tentes mais.\"";
  }

  // Loaded question
  if (names.has("loaded-question")) {
    return "\"Esta pergunta tem a resposta embutida. Não estou a perguntar — estou a acusar em formato de pergunta.\"";
  }

  // Imperative with absolute
  if (names.has("imperative") && names.has("absolute")) {
    return "\"Estou a dar ordens porque me sinto ignorado/a. A exigência é proporcional à frustração acumulada.\"";
  }

  if (names.has("imperative")) {
    return "\"Estou a exigir porque pedir não funcionou. Mas exigir também não vai funcionar — só vai gerar resistência.\"";
  }

  // Emotion words alone
  if (names.has("emotion-words")) {
    return null; // Naming emotions is actually healthy — no hidden subtext
  }

  // Absolute alone
  if (names.has("absolute")) {
    return "\"'Sempre' e 'nunca' não são factos — são a medida da minha frustração. Quanto mais absoluta a palavra, maior a dor.\"";
  }

  // Cold short
  if (names.has("cold-short")) {
    return "\"Ponto final em mensagem curta = frieza. Pode não ser intencional, mas é assim que chega.\"";
  }

  // Tu-focus
  if (names.has("tu-focus")) {
    return "\"Esta mensagem fala mais sobre ti do que sobre mim. E quando alguém só ouve 'tu, tu, tu', prepara-se para se defender.\"";
  }

  return null;
}

// ============================================================
// RECEIVER PERSPECTIVE — "Como o outro vai sentir isto"
// ============================================================

function generateReceiverPerspective(message: string, patterns: PatternMatch[]): string | null {
  const names = new Set(patterns.map(p => p.name));

  if (names.has("terse")) {
    return "Vai sentir que fez algo de errado, mas não vai saber o quê. Vai ficar a remoer. Pode enviar 3 mensagens a perguntar \"estás bem?\" ou, pior, vai afastar-se em silêncio.";
  }

  if (names.has("passive-aggressive")) {
    return "Vai sentir que há algo por dizer, mas que não tem permissão para perguntar. Isto gera ansiedade — o silêncio emocional é mais pesado do que uma discussão.";
  }

  if (names.has("self-blame-passive")) {
    return "Vai sentir-se obrigado/a a dizer \"não, a culpa não é tua\", mesmo que discorde. Estás a tirar-lhe a liberdade de ser honesto/a contigo.";
  }

  if (names.has("forced-apology")) {
    return "Vai sentir que a desculpa não é genuína. E uma desculpa forçada magoa mais do que nenhuma desculpa — porque mostra que não te importas o suficiente para ser sincero/a.";
  }

  if (names.has("blame")) {
    return "Vai entrar automaticamente em modo de defesa. Quando alguém se sente atacado, deixa de ouvir — e a tua mensagem, por mais válida que seja, não vai chegar.";
  }

  if (names.has("guilt-trip")) {
    return "Vai sentir-se em dívida, não empático/a. A culpa não gera ligação — gera ressentimento. E pode acabar por se afastar exactamente para fugir desse peso.";
  }

  if (names.has("ultimatum")) {
    return "Vai sentir medo, não compreensão. E decisões tomadas por medo nunca são sustentáveis — se ceder agora, vai guardar ressentimento para depois.";
  }

  if (names.has("sarcasm")) {
    return "Sem tom de voz, sarcasmo em texto é quase sempre lido como crueldade. Vai sentir que estás a gozar com algo que lhe importa.";
  }

  if (names.has("resigned")) {
    return "Vai entrar em pânico. \"Desisto\" lê-se como \"estou a desistir de nós\". Mesmo que não seja isso, o impacto emocional é devastador.";
  }

  if (names.has("accusation-lite")) {
    return "Vai sentir-se rotulado/a e catalogado/a. Quando dizes \"és sempre assim\", a pessoa não ouve o problema — ouve que já decidiste que ela é o problema.";
  }

  if (names.has("repetition-frustration")) {
    return "Vai sentir-se incompetente ou esquecido/a. A vergonha de \"já me tinham dito\" pode gerar tanto defensividade como shutdown emocional.";
  }

  if (names.has("edge-question")) {
    return "Vai sentir que qualquer resposta está errada. Estas perguntas não pedem respostas — pedem que o outro sinta a mesma frustração que tu.";
  }

  if (names.has("talk-trigger")) {
    return "Vai passar os próximos minutos (ou horas) a imaginar o pior cenário possível. \"Precisamos de falar\" sem contexto é um gerador de ansiedade.";
  }

  if (names.has("controlling")) {
    return "Vai sentir-se sufocado/a e infantilizado/a. Controlo gera duas reacções: submissão (temporária) ou rebelião. Nenhuma delas é ligação.";
  }

  if (names.has("dismissive")) {
    return "Vai sentir que os sentimentos dele/dela não importam. E quando alguém sente que não importa, ou grita mais alto ou desaparece.";
  }

  if (names.has("avoidance")) {
    return "Vai sentir-se rejeitado/a. \"Não me apetece falar\" pode ser legítimo, mas o outro só vai ouvir \"não és suficientemente importante para eu me esforçar\".";
  }

  if (names.has("comparison")) {
    return "Vai sentir vergonha, não motivação. Ninguém melhora porque foi comparado — melhora porque se sentiu apoiado.";
  }

  if (names.has("loaded-question")) {
    return "Vai sentir-se preso/a num interrogatório. Perguntas retóricas são armadilhas — qualquer resposta pode ser usada contra.";
  }

  if (names.has("imperative")) {
    return "Vai sentir que não tem escolha. E quando alguém sente que perdeu autonomia, a primeira reacção é resistir — mesmo que o pedido fosse razoável.";
  }

  if (names.has("tu-focus")) {
    return "Vai sentir-se no banco dos réus. Quando uma mensagem é toda sobre \"tu\", o receptor só ouve acusação — mesmo que não seja essa a intenção.";
  }

  if (names.has("absolute")) {
    return "Vai sentir que nada do que faz é suficiente. \"Nunca\" e \"sempre\" apagam todo o esforço passado com uma frase.";
  }

  if (names.has("cold-short")) {
    return "Vai sentir distância. Em texto, frieza é silêncio emocional — e o silêncio é interpretado sempre da pior forma possível.";
  }

  if (names.has("subtle-dismissal")) {
    return "Vai sentir que o que disse não foi ouvido de verdade. \"Não te preocupes\" muitas vezes comunica \"isso não é importante\" — mesmo que não seja a intenção.";
  }

  return null;
}

// ============================================================
// INSIGHT — the deep observation, the "wow"
// ============================================================

function generateInsight(message: string, tension: number, patterns: PatternMatch[]): string | null {
  const names = new Set(patterns.map(p => p.name));
  const n = normalize(message);

  // Multi-pattern insights (most powerful)
  if (names.has("blame") && names.has("absolute")) {
    return "Quando combinamos culpa com linguagem absoluta (\"tu nunca\", \"tu sempre\"), estamos a fazer duas coisas ao mesmo tempo: a acusar e a eliminar qualquer defesa possível. É como dizer \"és culpado e a prova é toda a tua história\". Ninguém sobrevive emocionalmente a isto sem se fechar.";
  }

  if (names.has("passive-aggressive") && names.has("resigned")) {
    return "Há aqui uma mistura de desistência e raiva contida. Estás a comunicar que desististe de ser ouvido/a — mas a forma como o dizes mostra que ainda te importas profundamente. O paradoxo é que esta mensagem pede ligação ao mesmo tempo que a torna quase impossível.";
  }

  if (names.has("guilt-trip") && names.has("blame")) {
    return "Esta mensagem faz duas coisas ao mesmo tempo: acusa e gera culpa. É como dizer \"tu fizeste-me isto E eu sacrifiquei-me por ti\". O receptor fica sem saída emocional — não pode defender-se sem parecer ingrato, nem concordar sem se submeter.";
  }

  if (names.has("accusation-lite") && names.has("absolute")) {
    return "Estás a dizer ao outro que ele é um padrão, não uma pessoa. \"Sempre\", \"como de costume\", \"típico\" — tudo isto comunica que já o catalogaste e que não acreditas que possa mudar. É uma profecia auto-realizável: se o outro sente que já foi julgado, não tem incentivo para tentar.";
  }

  if (names.has("terse") || names.has("cold-short")) {
    return "O silêncio emocional é a forma de comunicação mais ambígua que existe. O receptor vai preencher o vazio com os seus próprios medos — e o que imaginam é quase sempre pior do que a realidade. Uma mensagem curta não poupa tempo; cria horas de ansiedade no outro.";
  }

  if (names.has("passive-aggressive")) {
    return "O passivo-agressivo é uma forma de expressar raiva sem assumir que estamos com raiva. Protege-nos de conflito directo, mas ao preço de criar uma tensão subterrânea que corrói a relação por dentro. O antídoto não é engolir a raiva — é aprender a expressá-la directamente, com vulnerabilidade.";
  }

  if (names.has("blame")) {
    return "Por trás de toda a acusação há uma necessidade não expressa. \"Tu nunca\" provavelmente quer dizer \"preciso que\". Mas é muito mais difícil mostrar uma necessidade do que apontar uma falha — porque pedir é ser vulnerável, e acusar é ser forte. Só que a força de acusar gera a fraqueza da solidão.";
  }

  if (names.has("ultimatum")) {
    return "Os ultimatos surgem quando esgotamos todas as formas de comunicação que conhecemos. Não são sinais de força — são sinais de desespero disfarçados de poder. O problema é que funcionam a curto prazo (o medo é eficaz), mas destroem a confiança a longo prazo.";
  }

  if (names.has("resigned")) {
    return "A desistência verbal raramente é real desistência — é um grito num tom muito baixo. Quando alguém diz \"não sei para quê\" ou \"desisto\", está a testar se alguém se importa o suficiente para insistir. É vulnerabilidade disfarçada de indiferença.";
  }

  if (names.has("self-blame-passive")) {
    return "A auto-culpa forçada é uma das formas mais sofisticadas de manipulação emocional — e muitas vezes nem é consciente. Quando dizes \"se calhar o problema sou eu\", estás a criar uma armadilha onde o outro é obrigado a negar, a consolar, a provar que te ama. É um pedido de amor em código.";
  }

  if (names.has("sarcasm")) {
    return "O sarcasmo é armadura emocional. Usamos ironia quando a verdade nos deixa demasiado expostos. O problema é que a armadura não protege a relação — protege-nos a nós, às custas do outro.";
  }

  if (names.has("repetition-frustration")) {
    return "A frustração de repetir contém uma dor específica: \"não sou importante o suficiente para ser lembrado/a\". Não é sobre o assunto — é sobre sentir que o que dizes desaparece como se não tivesse sido dito.";
  }

  if (names.has("controlling")) {
    return "O controlo é sempre sobre medo. Controlamos quando sentimos que, se largarmos, tudo se desmorona. Mas o paradoxo é que quanto mais controlamos, mais o outro precisa de fugir — e mais validamos o nosso medo original.";
  }

  if (names.has("emotion-words") && tension < 4) {
    return "Nomear emoções é uma das competências emocionais mais importantes que existe. \"Estou triste\" é infinitamente mais claro e maduro do que demonstrar tristeza através de silêncio ou sarcasmo. Se estás a nomear o que sentes, estás a fazer comunicação emocional de qualidade.";
  }

  if (names.has("talk-trigger")) {
    return "\"Precisamos de falar\" é uma das frases com maior impacto emocional na língua portuguesa. Desencadeia uma resposta de stress quase imediata no receptor. Não porque a conversa vá ser má — mas porque a falta de contexto obriga o cérebro a preparar-se para o pior cenário possível.";
  }

  if (names.has("forced-apology")) {
    return "Pedir desculpa sem sentir o que se está a dizer é pior do que não pedir. O outro sente a diferença — e uma desculpa forçada comunica \"quero que isto acabe\" em vez de \"importo-me com o que sentes\".";
  }

  if (names.has("avoidance")) {
    return "Evitar não é resolver. Cada conversa evitada acumula-se como pressão emocional — até que um dia explode por algo insignificante e ninguém percebe porquê. Se não é o momento certo, a alternativa não é evitar — é adiar com intenção.";
  }

  if (names.has("subtle-dismissal")) {
    return "\"Não te preocupes\" pode ser gentileza ou pode ser dismissão — e o receptor decide qual é. Quando alguém partilha algo vulnerável e a resposta é curta e tranquilizante, muitas vezes sente que foi despachado em vez de ouvido.";
  }

  // Positive insights
  if (names.has("love") && names.has("warmth")) {
    return "Esta mensagem tem algo raro: carinho genuíno sem expectativa. Quando alguém lê palavras assim, o sistema nervoso relaxa. Não subestimes o poder de uma mensagem que simplesmente diz \"importas-me\".";
  }

  if (names.has("empathy")) {
    return "Respondeste com empatia — e isso é mais poderoso do que qualquer conselho. Quando alguém se sente verdadeiramente ouvido, metade do problema dissolve-se. Não porque desapareça, mas porque deixa de ser carregado sozinho.";
  }

  if (names.has("encouragement")) {
    return "Encorajamento genuíno é das formas mais puras de amor. Estás a dizer ao outro: \"vejo-te, acredito em ti, estou do teu lado\". Isto muda dias inteiros.";
  }

  return null;
}

// --- Suggestion ---

function generateSuggestion(tension: number, patterns: PatternMatch[]): string | null {
  const names = new Set(patterns.map(p => p.name));

  if (names.has("terse")) return "Experimenta acrescentar uma ou duas palavras que mostrem que estás presente. A diferença entre \"Ok\" e \"Ok, percebi\" é enorme para quem está do outro lado.";
  if (names.has("passive-aggressive")) return "Se estás com raiva, diz que estás com raiva. É mais assustador, mas muito mais honesto — e a honestidade é o que cria ligação real.";
  if (names.has("self-blame-passive")) return "Se queres validação, pede-a directamente. \"Preciso que me digas que estou a fazer bem\" é mais vulnerável, mas não obriga o outro a mentir.";
  if (names.has("ultimatum")) return "Se estás a chegar ao limite, expressa o limite sem ameaçar. \"Estou a chegar ao meu limite\" é diferente de \"Ou mudas ou acabou.\"";
  if (names.has("blame")) return "Troca \"tu\" por \"eu\". \"Tu nunca me ouves\" → \"Sinto que não estou a ser ouvido/a\". A mensagem é a mesma — o impacto é completamente diferente.";
  if (names.has("guilt-trip")) return "Expressa o que precisas sem referir o que já deste. \"Preciso de mais reconhecimento\" chega mais fundo do que \"Depois de tudo o que fiz...\".";
  if (names.has("sarcasm")) return "Diz o que sentes sem ironia. \"Isso magoou-me\" é mais difícil de dizer do que \"Que surpresa\", mas só uma das duas cria espaço para o outro te ouvir.";
  if (names.has("controlling")) return "Expressa o que precisas sem decidir pelo outro. \"Sinto-me inseguro/a quando...\" é diferente de \"Não podes...\".";
  if (names.has("dismissive")) return "Se precisas de espaço, diz isso directamente. \"Preciso de um momento\" é diferente de \"Não me interessa\".";
  if (names.has("talk-trigger")) return "Adiciona contexto ao pedido. \"Gostava de conversar sobre as férias quando tiveres um momento\" — o outro relaxa imediatamente.";
  if (names.has("resigned")) return "Se estás exausto/a, diz \"estou exausto/a\". É diferente de \"desisto\" — um pede apoio, o outro fecha portas.";
  if (names.has("accusation-lite")) return "Fala desta situação específica, não do padrão. \"Isto frustrou-me\" é diferente de \"és sempre assim\".";
  if (names.has("forced-apology")) return "Se não estás pronto/a para pedir desculpa genuinamente, diz isso. \"Preciso de tempo para processar\" é mais honesto do que \"Pronto, desculpa\".";
  if (names.has("repetition-frustration")) return "Foca no que precisas agora, não no que falhou antes. \"Preciso que isto fique resolvido\" é diferente de \"Já te disse mil vezes\".";
  if (names.has("edge-question")) return "Transforma a pergunta retórica num pedido real. \"Não sei o que fazer\" é mais honesto do que \"Que queres que te diga?\".";
  if (names.has("avoidance")) return "Se não é o momento, marca uma altura. \"Podemos falar amanhã com calma?\" é diferente de \"Não me apetece falar\".";
  if (names.has("comparison")) return "Foca no que precisas, não no que outros conseguem. \"Gostava que...\" é mais eficaz do que \"Toda a gente consegue menos tu\".";
  if (names.has("loaded-question")) return "Diz directamente o que te frustra em vez de o disfarçar como pergunta.";
  if (names.has("subtle-dismissal")) return "Antes de tranquilizar, mostra que ouviste. \"Percebo que isso te preocupa. Vamos resolver juntos\" é diferente de \"Não te preocupes\".";
  if (names.has("cold-short")) return "Uma ou duas palavras extra mostram que estás emocionalmente presente.";
  if (names.has("tu-focus")) return "Reformula com linguagem em \"eu\". O mesmo conteúdo, sem o dedo apontado.";
  if (names.has("shouting")) return "Baixa o tom para seres ouvido/a. MAIÚSCULAS em texto = gritar.";
  if (names.has("aggressive-question")) return "Reformula como pedido em vez de acusação disfarçada de pergunta.";

  if (names.has("emotion-words") && tension > 2) return "Estás a nomear o que sentes — isso é bom. Atenção apenas ao tom geral da mensagem.";

  if (tension > 5) return "Esta mensagem tem carga emocional forte. Se possível, espera uns minutos antes de enviar — a versão de daqui a 10 minutos vai ser mais clara.";
  if (tension > 2) return "O tom tem alguma carga. Uma pequena suavização pode mudar a forma como chega.";

  return null;
}

// --- Rewrite ---

function generateRewrite(message: string, tension: number, patterns: PatternMatch[]): string | null {
  const names = new Set(patterns.map(p => p.name));

  // Patterns that ALWAYS get a rewrite, regardless of tension score
  const alwaysRewrite = ["terse", "cold-short", "passive-aggressive", "forced-apology",
    "self-blame-passive", "talk-trigger", "subtle-dismissal"];
  const hasSpecificPattern = alwaysRewrite.some(p => names.has(p));

  if (tension < 1.5 && !hasSpecificPattern) return null;
  let rewrite = message;

  rewrite = rewrite.replace(/\bsempre\b/gi, "muitas vezes");
  rewrite = rewrite.replace(/\bnunca\b/gi, "raramente");

  rewrite = rewrite.replace(/\btens de\b/gi, "seria bom se pudesses");
  rewrite = rewrite.replace(/\btens que\b/gi, "seria bom se pudesses");
  rewrite = rewrite.replace(/\bdevias\b/gi, "talvez possas considerar");
  rewrite = rewrite.replace(/\bdevia\b/gi, "talvez pudesse");
  rewrite = rewrite.replace(/\bpara com\b/gi, "preferia que não");
  rewrite = rewrite.replace(/\bdeixa de\b/gi, "preferia que não");
  rewrite = rewrite.replace(/\bpara de\b/gi, "preferia que não");

  if (names.has("terse")) {
    const terseMap: Record<string, string> = {
      "ok": "Ok, compreendo.",
      "ok.": "Ok, percebi. Obrigado/a.",
      "pois": "Percebo o que estás a dizer.",
      "pois.": "Percebo o que estás a dizer.",
      "sim sim": "Sim, faz sentido.",
      "sim": "Sim, percebi.",
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
    if (terseMap[key]) rewrite = terseMap[key];
  }

  if (names.has("passive-aggressive")) {
    rewrite = rewrite.replace(/\bfaz como quiseres\b/gi, "gostava de encontrar uma solução juntos");
    rewrite = rewrite.replace(/\bfaz o que (tu )?quiseres\b/gi, "gostava de decidir isto juntos");
    rewrite = rewrite.replace(/\bcomo queiras\b/gi, "o que achas que seria melhor?");
    rewrite = rewrite.replace(/\btanto faz\b/gi, "não tenho uma preferência forte — e tu?");
    rewrite = rewrite.replace(/\bnão é nada\b/gi, "há algo que me está a incomodar");
    rewrite = rewrite.replace(/\besquece\b/gi, "quero falar sobre isto, mas noutra altura");
    rewrite = rewrite.replace(/\bdeixa estar\b/gi, "prefiro conversar quando estivermos calmos");
    rewrite = rewrite.replace(/\bse é isso que queres\b/gi, "quero perceber melhor o que preferes");
    rewrite = rewrite.replace(/\bse tu dizes\b/gi, "confio em ti, mas gostava de perceber melhor");
  }

  if (names.has("blame")) {
    rewrite = rewrite.replace(/\btu é que\b/gi, "sinto que");
    rewrite = rewrite.replace(/\ba culpa é tua\b/gi, "sinto-me frustrado/a com esta situação");
    rewrite = rewrite.replace(/\bpor tua causa\b/gi, "quando isto acontece, eu sinto");
    rewrite = rewrite.replace(/\bfoste tu\b/gi, "senti que");
    rewrite = rewrite.replace(/\btu nunca\b/gi, "sinto que raramente");
    rewrite = rewrite.replace(/\btu só\b/gi, "sinto que muitas vezes");
  }

  if (names.has("talk-trigger")) {
    rewrite = rewrite.replace(/\bprecisamos de falar\b/gi, "gostava de conversar contigo quando tiveres um momento");
    rewrite = rewrite.replace(/\btemos de falar\b/gi, "gostava de conversar contigo quando puderes");
    rewrite = rewrite.replace(/\btemos que falar\b/gi, "gostava de falar contigo sobre uma coisa");
    rewrite = rewrite.replace(/\bprecisamos de conversar\b/gi, "gostava de conversar contigo sobre algo");
  }

  if (names.has("guilt-trip")) {
    rewrite = rewrite.replace(/\bdepois de tudo o que\b/gi, "valorizo o que");
    rewrite = rewrite.replace(/\beu faço tudo\b/gi, "sinto que tenho feito muito");
    rewrite = rewrite.replace(/\bninguém reconhece\b/gi, "gostava de me sentir mais reconhecido/a");
    rewrite = rewrite.replace(/\bninguém agradece\b/gi, "gostava de sentir mais reconhecimento");
  }

  if (names.has("repetition-frustration")) {
    rewrite = rewrite.replace(/\boutra vez\b/gi, "novamente");
    rewrite = rewrite.replace(/\bjá te disse\b/gi, "como já tínhamos falado");
    rewrite = rewrite.replace(/\bquantas vezes\b/gi, "sinto que já conversámos várias vezes sobre isto");
  }

  if (names.has("edge-question")) {
    rewrite = rewrite.replace(/\ba sério\??/gi, "estou a tentar perceber —");
    rewrite = rewrite.replace(/\bque queres que te diga\b/gi, "não sei bem o que dizer, mas quero ser honesto/a");
    rewrite = rewrite.replace(/\bo que queres que (eu )?faça\b/gi, "o que achas que podemos fazer juntos?");
  }

  if (names.has("accusation-lite")) {
    rewrite = rewrite.replace(/\blá estás tu\b/gi, "quando isto acontece, sinto que");
    rewrite = rewrite.replace(/\bcomo sempre\b/gi, "como tem acontecido");
    rewrite = rewrite.replace(/\bcomo de costume\b/gi, "como tem sido habitual");
    rewrite = rewrite.replace(/\btípico\b/gi, "sinto que isto se repete");
  }

  if (names.has("self-blame-passive")) {
    rewrite = rewrite.replace(/\bse calhar sou eu\b/gi, "se calhar precisamos de perceber isto juntos");
    rewrite = rewrite.replace(/\bo problema sou eu\b/gi, "sinto-me parte do problema, mas gostava de resolver");
  }

  if (names.has("forced-apology")) {
    rewrite = rewrite.replace(/\bpronto,? desculpa\b/gi, "peço desculpa — percebo que te magoei");
    rewrite = rewrite.replace(/\bdesculpa lá\b/gi, "peço-te desculpa sinceramente");
  }

  // Subtle dismissal rewrites
  if (names.has("subtle-dismissal")) {
    rewrite = rewrite.replace(/\bnão te preocupes\b/gi, "percebo que te preocupa, vamos resolver");
    rewrite = rewrite.replace(/\bnão faz mal\b/gi, "percebo — obrigado/a por dizeres");
    rewrite = rewrite.replace(/\bdeixa lá\b/gi, "quero perceber melhor o que se passa");
    rewrite = rewrite.replace(/\bestá tudo bem\b/gi, "obrigado/a por perguntares — estou a processar");
    rewrite = rewrite.replace(/\bnão há problema\b/gi, "tudo bem, obrigado/a por teres tido esse cuidado");
    rewrite = rewrite.replace(/\bnão é preciso\b/gi, "agradeço a oferta — de momento estou bem");
    rewrite = rewrite.replace(/\beu sei\b/gi, "sim, percebi — obrigado/a");
  }

  rewrite = rewrite.replace(/!{2,}/g, ".");
  rewrite = rewrite.replace(/\?{2,}/g, "?");

  if (names.has("shouting")) {
    rewrite = rewrite.charAt(0).toUpperCase() + rewrite.slice(1).toLowerCase();
  }

  return rewrite !== message ? rewrite : null;
}

// --- Tone Classification ---

function classifyTone(tension: number, positiveScore: number, patterns: PatternMatch[]): string {
  const names = new Set(patterns.map(p => p.name));

  if (names.has("passive-aggressive") || names.has("self-blame-passive")) return "passivo-agressivo";
  if (names.has("ultimatum")) return "ultimato";
  if (names.has("blame")) return "acusatório";
  if (names.has("guilt-trip")) return "culpabilização";
  if (names.has("sarcasm")) return "sarcástico";
  if (names.has("controlling")) return "controlador";
  if (names.has("dismissive")) return "desdenhoso";
  if (names.has("shouting")) return "agressivo";
  if (names.has("comparison")) return "crítico";
  if (names.has("avoidance")) return "evitante";
  if (names.has("resigned")) return "resignado";
  if (names.has("forced-apology")) return "desculpa forçada";
  if (names.has("accusation-lite")) return "subtilmente acusatório";
  if (names.has("repetition-frustration")) return "frustrado";
  if (names.has("edge-question")) return "defensivo";
  if (names.has("terse")) return "seco";
  if (names.has("loaded-question")) return "crítica disfarçada";
  if (names.has("tu-focus")) return "focado no outro";

  if (tension > 7) return "muito tenso";
  if (tension > 5) return "tenso";
  if (tension > 3) return "com carga";
  if (tension > 1.5) return "ligeiramente carregado";

  if (names.has("love")) return "carinhoso";
  if (names.has("empathy")) return "empático";
  if (names.has("gratitude")) return "agradecido";
  if (names.has("encouragement")) return "encorajador";
  if (names.has("warmth")) return "caloroso";
  if (names.has("invitation")) return "aberto";

  if (positiveScore > 3) return "positivo";
  if (positiveScore > 1) return "amigável";

  return "neutro";
}

// --- Main ---

function analyzeLocally(message: string): EmotionalAnalysis {
  const patterns = detectPatterns(message);

  let tension = 0;
  let positiveScore = 0;

  for (const p of patterns) {
    tension += p.tensionWeight;
    positiveScore += p.positiveWeight;
  }

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
  const subtext = generateSubtext(message, patterns);
  const receiverPerspective = generateReceiverPerspective(message, patterns);
  const insight = generateInsight(message, tension, patterns);

  return {
    tone,
    intensity,
    sentiment,
    tension: Math.round(tension),
    suggestion,
    rewrite,
    patterns: patterns.map(p => p.label),
    subtext,
    receiverPerspective,
    insight,
  };
}

export { SYSTEM_PROMPT };
