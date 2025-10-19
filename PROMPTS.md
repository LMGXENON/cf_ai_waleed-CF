# AI Prompts Used During Development

This file documents the AI assistance I used while building this project.

## Configuration Setup

**Prompt:** "In wrangler.toml how do I set up the AI binding? The docs are confusing me"

**Prompt:** "Which Llama model name do I use? Tried 'llama-3.3' but getting 404"

## Durable Objects Implementation

**Prompt:** "Why does my messages array keep resetting? I'm saving to storage but next request it's empty again"

Learned I needed to load from storage in the fetch method.

## Worker API Issues

**Prompt:** "My frontend can't call the worker API - getting CORS error. What am I missing?"

Got the headers I needed to add for cross-origin requests.

**Prompt:** "env.AI.run() - what format does the messages parameter need to be?"

Got an example of the array structure with role and content fields.

## Frontend Debugging

**Prompt:** "User input going straight to innerHTML - is this safe or will I get hacked?"

Learned about XSS attacks and made an escape function.

**Prompt:** "POST to /api/chat returns error 'unexpected end of JSON input' but the endpoint exists"

Fixed by adding response.ok check before calling .json()

## Deployment Problems

**Prompt:** "Error: 'idFromName is not a function' - works on my machine though"

Missing durable_objects.bindings in wrangler.toml - added that section.

## Code Cleanup

**Prompt:** "Does this make sense or is there a better way?" [pasted loadHistory function]

Got some suggestions for simplifying the code.

**Prompt:** "What goes in .gitignore for Workers projects?"

Got the list of files to ignore like node_modules and .wrangler

## Summary

Used AI mainly for:
- Cloudflare-specific configuration syntax
- Debugging errors I couldn't figure out
- Security best practices
- Getting API format examples

Total prompts: around 15-20 throughout development
