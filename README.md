# cf_ai_waleed-AI

AI chat application using Cloudflare Workers AI with Llama 3.3, Durable Objects for message storage, and a simple web interface.

## Description

This is a chat app where you can talk to an AI. The AI remembers your conversation history. Each user gets a unique session that stores their messages.

## Tech Stack

- Cloudflare Workers (backend API)
- Workers AI with Llama 3.3 (AI model)
- Durable Objects (persistent storage)
- HTML/CSS/JavaScript (frontend)

## Setup

Install dependencies:
```bash
npm install
```

Login to Cloudflare:
```bash
npx wrangler login
```

Run locally:
```bash
npm run dev
```

Open http://localhost:8787

## Deploy

```bash
npm run deploy
```

Your app will be live at a workers.dev URL.

## Project Structure

```
cf_ai_waleed-AI/
├── src/
│   └── index.js          - Worker and Durable Object code
├── public/
│   ├── index.html        - Chat interface
│   ├── styles.css        - Styles
│   └── app.js            - Frontend logic
├── package.json
├── wrangler.toml         - Cloudflare configuration
└── README.md
```

## API Endpoints

- `POST /api/chat` - Send message and get AI response
- `POST /api/clear` - Clear chat history
- `POST /api/history` - Get message history

## Configuration

Edit `wrangler.toml` for Cloudflare settings. The file includes:
- AI binding for Llama 3.3
- Durable Objects binding for message storage
- Assets binding for static files

## Requirements

- Node.js 18+
- Cloudflare account (free tier works)

## Links

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
