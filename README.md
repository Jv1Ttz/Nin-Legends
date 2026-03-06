# 忍 Nin Legends - RPG de Mesa com IA no Universo Naruto

Aplicação web de RPG de texto onde uma IA atua como mestre de RPG (Game Master) no universo de Naruto. Possui HUD imersiva, sistema de combate, inventário, missões, mapa interativo e geração de imagens.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Banco de Dados:** PostgreSQL (via Prisma ORM — ex.: Supabase)
- **IA Texto:** Google Gemini API (ou Groq, configurado via ambiente)
- **IA Imagens:** Hugging Face Inference API (Stable Diffusion XL)
- **Audio:** Howler.js

## Setup Rápido

### 1. Instalar dependências

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configurar variáveis de ambiente

Edite `server/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
JWT_SECRET="sua-chave-secreta-aqui"
GEMINI_API_KEY="sua-chave-gemini-aqui"
GROQ_API_KEY="sua-chave-groq-aqui"            # opcional, se quiser usar Groq
HUGGINGFACE_API_KEY="sua-chave-huggingface-aqui" # opcional, apenas para imagens
AI_PROVIDER="gemini"                          # ou "groq"
PORT=3001
```

**Como obter as chaves (gratuitas):**

- **Gemini:** Acesse [Google AI Studio](https://aistudio.google.com/apikey) e crie uma API key
- **Hugging Face:** Acesse [Hugging Face Settings](https://huggingface.co/settings/tokens) e crie um token (opcional, para geração de imagens)

### 3. Inicializar o banco de dados

```bash
cd server
npx prisma db push
```

### 4. Rodar o projeto

Em dois terminais separados:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Acesse: **http://localhost:5173**

## Funcionalidades

- Login/registro com username e senha
- Criação de personagem (nome, vila, elemento)
- Narrativa imersiva gerada por IA
- Sistema de combate com dados d20 (IA solicita a rolagem via [DICE], o jogador rola manualmente na aba de Dados)
- Barras de HP, Chakra e XP
- Sistema de atributos com pontos distribuíveis a cada nível (+2 pontos por level up)
- Inventário de itens
- Quadro de missões (ranks D-S)
- Mapa interativo do mundo ninja
- Log de combate em tempo real
- Geração de imagens em cenas importantes
- Sistema de áudio ambiente
- Interface responsiva (desktop e mobile)

## Áudio (Opcional)

Para habilitar efeitos sonoros, adicione arquivos MP3 em `client/public/sounds/`:

- `ambient-village.mp3` - Música ambiente para vilas
- `ambient-forest.mp3` - Música ambiente para florestas
- `ambient-combat.mp3` - Música de combate
- `sfx-dice.mp3` - Som de rolagem de dados
- `sfx-hit.mp3` - Som de dano
- `sfx-jutsu.mp3` - Som de jutsu
- `sfx-levelup.mp3` - Som de level up
- `sfx-mission.mp3` - Som de missão completa
- `sfx-message.mp3` - Som de nova mensagem
