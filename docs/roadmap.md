# Roadmap

## Fase 1 — MVP (Meses 1–3)

### Mês 1: Validação Rápida

#### Semanas 1–2: Bot WhatsApp "Linqo Lite"

**Objectivo:** provar que as pessoas querem inteligência relacional na comunicação.

- [ ] Construir Bot no WhatsApp Business API (recebe mensagens reencaminhadas, devolve análise emocional)
- [ ] Experiência: utilizador reencaminha conversa → bot responde com análise de tom, tensão e sugestões
- [ ] Testar com primeiros 50 utilizadores (clientes de coaching, casais, amigos próximos)
- [ ] Custo: $0 (API gratuita do WhatsApp Business + Claude API)

#### Semanas 3–4: Medir e Aprender

- [ ] Quantas pessoas usam mais de uma vez?
- [ ] Que tipo de conversas reencaminham?
- [ ] Que feedback dão sobre as sugestões da IA?
- [ ] Pagariam por isto?

> Se <30% voltam na 2ª semana → ajustar conceito. Se >50% voltam → validação forte para avançar.

### Meses 2–3: Web App MVP — A Casa do Linqo

- [ ] Login por número de telefone
- [ ] Contactos importados do telefone
- [ ] Canais de intenção por contacto (pessoal, profissional, projectos)
- [ ] Mensagens em tempo real com WebSocket
- [ ] IA que analisa tom antes de enviar (opt-in)
- [ ] Priorização automática de mensagens recebidas (urgente, pode esperar, quando quiseres)
- [ ] Filtro de chegada para novos contactos

**Stack:** React/Next.js (PWA) + Supabase + Modelos open-source (Mistral/Llama) + Vercel/Railway

## Fase 2 — Primeiros 200 Utilizadores + Primeira Receita (Meses 4–6)

### Lançamento Controlado

- [ ] Migrar utilizadores do bot WhatsApp para a web app
- [ ] Expandir para 200 utilizadores via comunidade de coaching e boca-a-boca
- [ ] Recolher feedback obsessivamente — falar com cada utilizador

### Monetização: Plano Eco (lança no mês 4)

- [ ] Implementar plano gratuito (mensagens, canais, filtro, priorização básica)
- [ ] Implementar plano Eco $3–5/mês (IA emocional profunda, sugestões de timing, memória relacional, insights)

**Projecção:** 200 utilizadores × 20% conversão × $4/mês = 40 assinantes = **$160/mês**

**Meta mês 6:** Break-even com ~500 utilizadores e ~$400/mês de receita

## Fase 3 — Crescimento Orgânico para 2.000 Utilizadores (Meses 7–12)

### Produto

- [ ] App nativa React Native (iOS + Android) construída sobre a base web
- [ ] IA relacional completa com memória de relação
- [ ] Eco Pro para coaches e terapeutas ($12–15/mês)
- [ ] Marketplace de templates relacionais (fase inicial)

### Crescimento

- [ ] Parceria com 10 coaches/terapeutas que usam Linqo com clientes
- [ ] Cada coach traz 20–50 clientes = 200–500 novos utilizadores
- [ ] Funcionalidade "convida o teu parceiro" como motor principal
- [ ] Conteúdo orgânico: artigos, posts, testemunhos reais

### Projecção de Receita (mês 12)

| Fonte | Cálculo | Receita/mês |
|-------|---------|-------------|
| Eco (20% de 2.000) | 400 × $4 | $1.600 |
| Eco Pro (10 coaches) | 10 × $13 | $130 |
| Templates | Estimativa inicial | $70 |
| **TOTAL** | | **~$1.800/mês** |

## Visão Ano 2: Escala para 20.000+ Utilizadores

Três opções estratégicas com tracção comprovada:

- **Opção A: Continuar Bootstrap** — crescer organicamente, reinvestir receita, manter controlo total ($10K–$20K/mês)
- **Opção B: Investimento Estratégico** — negociar de posição de força, ceder 10–15% estrategicamente
- **Opção C: Licenciar a Tecnologia** — telecomunicações, plataformas de RH e apps de saúde mental podem licenciar a IA relacional

## Visão Geral: 12 Meses

| Período | Marco | Utilizadores | Receita | Custo Total Acum. |
|---------|-------|-------------|---------|-------------------|
| Mês 1 | Bot WhatsApp live | 50 | $0 | ~$50 |
| Mês 3 | Web App MVP live | 100 | $0 | ~$200 |
| Mês 4 | Plano Eco lança | 200 | $160/mês | ~$350 |
| Mês 6 | Break-even | 500 | $400/mês | $0 (coberto) |
| Mês 9 | App nativa + Eco Pro | 1.000 | $900/mês | Lucro |
| Mês 12 | Marketplace + escala | 2.000+ | $1.800/mês | Lucro crescente |

## Decisões a Tomar Agora

| # | Decisão | Recomendação |
|---|---------|-------------|
| 1 | Registar domínio linqo.app | Fazer hoje — $12–15, protege o nome |
| 2 | Começar pelo bot WhatsApp ou web app? | Bot primeiro (2–3 semanas), web app em paralelo |
| 3 | Linqo como projecto separado ou dentro do Sete Ecos? | Separado — marca própria, pode integrar depois |
| 4 | Primeiros 50 utilizadores: quem? | Clientes de coaching + 10 casais que conheces |
| 5 | Língua inicial | Português — depois inglês na expansão |
| 6 | Dedicação de tempo | 2–3 horas/dia nos primeiros 3 meses bastam |
