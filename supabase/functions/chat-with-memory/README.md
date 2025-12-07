# Chat with Memory - Edge Function

A practical AI chatbot that remembers user context using Mem0.

## Features

- Stores conversation messages as memories
- Searches relevant context before responding
- CORS-enabled for web clients
- Error handling with proper status codes

## Local Testing

```bash
# Start Supabase locally
supabase start

# Serve the function
supabase functions serve chat-with-memory --env-file supabase/.env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/chat-with-memory \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "message": "I love hiking in the mountains"
  }'
```

## Deploy

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Set the secret
supabase secrets set MEM0_API_KEY=your-api-key

# Deploy
supabase functions deploy chat-with-memory
```

## API

**Endpoint:** `POST /functions/v1/chat-with-memory`

**Request:**
```json
{
  "userId": "string",
  "message": "string",
  "includeContext": boolean (optional, default: true)
}
```

**Response:**
```json
{
  "response": "string",
  "memoriesFound": number,
  "userId": "string"
}
```
