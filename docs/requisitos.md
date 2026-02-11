# Requisitos do Produto

## Custos e Infraestrutura

### Serviços Grátis ou Quase Grátis

| Recurso | Serviço | Custo |
|---------|---------|-------|
| Mensagens em tempo real | Firebase / Supabase | Grátis até 100K msg/mês |
| Autenticação por telefone | Firebase Auth | Grátis até 10K/mês |
| Base de dados | Supabase / PlanetScale | Grátis (tier inicial) |
| Hosting backend | Railway / Render | $5–$10/mês |
| Domínio | linqo.app | $12–$15/ano |
| Google Play Store | Publicação | $25 (uma vez) |
| Apple App Store | Publicação | $99/ano |
| IA (análise emocional) | Modelos open-source locais | Grátis (no dispositivo) |
| Desenvolvimento | Tu + Claude Code | $20/mês (Pro) |

### Custo Total dos Primeiros 6 Meses

| Item | Valor |
|------|-------|
| Infraestrutura (6 meses) | ~$60–$90 |
| Stores (Google + Apple) | ~$124 |
| Domínio | ~$15 |
| Claude Pro (6 meses) | ~$120 |
| **TOTAL** | **~$320–$350** |

## Três Caminhos Técnicos

| | Caminho A: Web App (PWA) | Caminho B: App Nativa | Caminho C: Bot WhatsApp |
|---|---|---|---|
| Tempo até MVP | 4–6 semanas | 8–12 semanas | 2–3 semanas |
| Custo mensal | $10–$20 | $30–$50 | $0–$15 |
| Fricção de adopção | Baixa (link no browser) | Média (instalar app) | Zero (já no WhatsApp) |
| Experiência | Boa | Excelente | Limitada |
| Notificações push | Parcial (Android sim, iOS limitado) | Completas | Via WhatsApp |
| Escalabilidade | Alta | Alta | Limitada pela API |

**Recomendação:** Caminho A + C em Paralelo — Bot WhatsApp para validar (2–3 semanas), Web App como casa permanente em paralelo.

## Funcionalidades Principais

### F1 — Bot WhatsApp "Linqo Lite"

- **Descrição:** Bot no WhatsApp Business API que recebe mensagens reencaminhadas e devolve análise emocional
- **Prioridade:** Alta
- **Experiência:** O utilizador reencaminha uma conversa e o bot responde com análise de tom, tensão e sugestões
- **Critérios de aceitação:**
  - Bot funcional no WhatsApp Business API
  - Recebe mensagens reencaminhadas
  - Devolve análise emocional (tom, tensão, sugestões)
  - Testado com 50 utilizadores iniciais

### F2 — Login por Número de Telefone

- **Descrição:** Autenticação via número de telefone (SMS/OTP)
- **Prioridade:** Alta
- **Critérios de aceitação:**
  - Login funcional por SMS
  - Suporte a números portugueses e brasileiros

### F3 — Canais de Intenção por Contacto

- **Descrição:** Cada contacto pode ter canais separados (pessoal, profissional, projectos)
- **Prioridade:** Alta
- **Critérios de aceitação:**
  - Criar/editar canais por contacto
  - Mensagens organizadas por canal

### F4 — Mensagens em Tempo Real

- **Descrição:** Sistema de mensagens em tempo real com WebSocket
- **Prioridade:** Alta
- **Critérios de aceitação:**
  - Entrega de mensagens em tempo real
  - Indicadores de leitura e digitação

### F5 — IA de Análise Emocional (opt-in)

- **Descrição:** IA que analisa o tom da mensagem antes de enviar, com activação voluntária
- **Prioridade:** Alta
- **Critérios de aceitação:**
  - Análise de sentimento/tom antes do envio
  - Opt-in por mensagem ou por conversa
  - Sugestões de reformulação

### F6 — Priorização Automática de Mensagens

- **Descrição:** Classificação automática de mensagens recebidas em urgente, pode esperar, quando quiseres
- **Prioridade:** Média
- **Critérios de aceitação:**
  - Três níveis de prioridade
  - Classificação automática por IA

### F7 — Filtro de Chegada para Novos Contactos

- **Descrição:** Controlo sobre quem pode iniciar conversa
- **Prioridade:** Média
- **Critérios de aceitação:**
  - Novos contactos passam por filtro
  - Utilizador aprova/rejeita pedidos de contacto

## Stack Técnico do MVP (Web App)

- **Frontend:** React/Next.js como PWA
- **Backend:** Supabase (auth + database + realtime)
- **IA:** Modelos open-source (Mistral/Llama) para análise de sentimento no dispositivo
- **Deploy:** Vercel (grátis para hobby) ou Railway ($5/mês)

## Monetização: Plano Eco (lança no mês 4)

| Funcionalidade | Gratuito | Eco ($3–5/mês) |
|---|---|---|
| Mensagens + canais | ✓ | ✓ |
| Filtro de chegada | ✓ | ✓ |
| Priorização básica | ✓ | ✓ |
| IA emocional profunda | ✗ | ✓ |
| Sugestões de timing | ✗ | ✓ |
| Memória relacional | ✗ | ✓ |
| Insights de relação | ✗ | ✓ |

## Requisitos Não-Funcionais

- **Performance:** Mensagens entregues em tempo real (<1s latência)
- **Segurança:** Encriptação de mensagens, autenticação segura, dados sensíveis protegidos
- **Escalabilidade:** Infraestrutura que suporta crescimento de 50 a 2.000+ utilizadores sem reescrita
- **Privacidade:** Análise emocional opt-in, dados de IA processados localmente quando possível
