# Linqo — Comunicação Consciente

Plataforma de mensagens com inteligência relacional integrada. Análise emocional por IA, canais de intenção, priorização automática e memória relacional.

> *"Não esperes permissão para construir o que o mundo precisa."*

## Estrutura do Projecto

```
docs/                    # Documentação do produto
├── visao-produto.md     # Visão geral, filosofia e proposta de valor
├── requisitos.md        # Requisitos, stack técnico e monetização
└── roadmap.md           # Roadmap semana a semana (12 meses)

app/                     # Web App (Next.js + Supabase)
├── src/
│   ├── app/
│   │   ├── page.tsx             # Landing page com lista de espera
│   │   ├── login/page.tsx       # Login
│   │   ├── registro/page.tsx    # Registo
│   │   ├── chat/page.tsx        # Chat com canais de intenção
│   │   └── api/
│   │       ├── waitlist/route.ts   # API lista de espera
│   │       └── analyze/route.ts    # API análise emocional
│   └── lib/
│       ├── supabase/            # Configuração Supabase
│       └── ai/                  # Motor de análise emocional
└── supabase/
    └── schema.sql               # Schema da base de dados
```

## Quick Start

```bash
cd app
npm install
cp .env.local.example .env.local
# Edita .env.local com as tuas credenciais Supabase
npm run dev
```

## Stack Técnico

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4
- **Backend:** Supabase (Auth + PostgreSQL + Realtime)
- **IA:** Análise emocional local + API OpenAI (opcional)
- **Deploy:** Vercel (free tier)

## Documentação

- **[Visão do Produto](docs/visao-produto.md)** — Problema, público-alvo, proposta de valor e objectivos
- **[Requisitos](docs/requisitos.md)** — Funcionalidades, custos, stack técnico e planos de monetização
- **[Roadmap](docs/roadmap.md)** — Planeamento detalhado: validação, MVP, crescimento e escala

## Como contribuir

1. Crie uma branch a partir de `main`
2. Adicione ou edite os documentos na pasta `docs/`
3. Abra um Pull Request para revisão
