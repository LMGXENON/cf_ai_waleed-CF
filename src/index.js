// this class handles storing messages for each user session
// cloudflare creates one instance per session ID
export class ChatSession {
  constructor(state) {
    this.state = state;
    this.messages = [];
  }

  async fetch(request) {
    const url = new URL(request.url);

    // load messages from storage if we haven't already
    if (this.messages.length === 0) {
      this.messages = await this.state.storage.get("messages") || [];
    }

    // add a new message to the list
    if (url.pathname === "/add" && request.method === "POST") {
      const msg = await request.json();
      this.messages.push({ ...msg, time: Date.now() });
      await this.state.storage.put("messages", this.messages);
      return new Response(JSON.stringify({ ok: true }));
    }

    // get all messages
    if (url.pathname === "/get") {
      return new Response(JSON.stringify(this.messages));
    }

    // wipe everything
    if (url.pathname === "/clear" && request.method === "POST") {
      this.messages = [];
      await this.state.storage.delete("messages");
      return new Response(JSON.stringify({ ok: true }));
    }

    return new Response("not found", { status: 404 });
  }
}

// main worker that handles all requests
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // allow requests from anywhere (CORS)
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // browser preflight check
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // main chat endpoint - this is where messages come in
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message, sessionId } = await request.json();
        
        // get the storage for this specific session
        const id = env.CHAT_SESSIONS.idFromName(sessionId);
        const session = env.CHAT_SESSIONS.get(id);

        // grab the conversation history
        const historyResp = await session.fetch(new Request("http://x/get"));
        const history = await historyResp.json();

        // save what the user just said
        await session.fetch(new Request("http://x/add", {
          method: "POST",
          body: JSON.stringify({ role: "user", content: message })
        }));

        // build the full conversation to send to the AI
        // including system prompt and all previous messages
        const context = [
          { role: "system", content: "You're a helpful assistant. Keep answers short and friendly." },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: message }
        ];

        // call the AI model
        const ai = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
          messages: context,
          max_tokens: 500
        });

        // save the AI's response
        await session.fetch(new Request("http://x/add", {
          method: "POST",
          body: JSON.stringify({ role: "assistant", content: ai.response })
        }));

        return new Response(JSON.stringify({ response: ai.response }), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 500, 
          headers 
        });
      }
    }

    // delete all messages for a session
    if (url.pathname === "/api/clear" && request.method === "POST") {
      const { sessionId } = await request.json();
      const id = env.CHAT_SESSIONS.idFromName(sessionId);
      const session = env.CHAT_SESSIONS.get(id);
      await session.fetch(new Request("http://x/clear", { method: "POST" }));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // get all messages for a session (used when page loads)
    if (url.pathname === "/api/history" && request.method === "POST") {
      const { sessionId } = await request.json();
      const id = env.CHAT_SESSIONS.idFromName(sessionId);
      const session = env.CHAT_SESSIONS.get(id);
      const resp = await session.fetch(new Request("http://x/get"));
      const messages = await resp.json();
      return new Response(JSON.stringify({ messages }), { headers });
    }

    // everything else - serve the HTML/CSS/JS files
    return env.ASSETS.fetch(request);
  }
};
