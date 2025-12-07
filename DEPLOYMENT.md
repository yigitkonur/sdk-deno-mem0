# Deployment Guide

## Quick Start

### 1. Test Locally

```bash
# Set API key
export MEM0_API_KEY=m0-GtnsfBLQexS6yhfReuT4dSDBZhuOTXOOTUIvfaEN

# Run an example
deno run --allow-net --allow-env examples/01_basic_usage.ts
```

### 2. Test Supabase Functions Locally

```bash
# Start Supabase
supabase start

# Serve a function
supabase functions serve chat-with-memory --env-file supabase/.env.local

# Test with curl (in another terminal)
curl -X POST http://localhost:54321/functions/v1/chat-with-memory \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","message":"Hello, I love Deno!"}'
```

### 3. Deploy to Supabase

```bash
# Link your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set MEM0_API_KEY=your-api-key

# Deploy function
supabase functions deploy chat-with-memory

# Test deployed function
curl -X POST https://your-project.supabase.co/functions/v1/chat-with-memory \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice","message":"I enjoy hiking"}'
```

## Available Functions

| Function | Purpose | Methods Used |
|----------|---------|--------------|
| `chat-with-memory` | AI chatbot with context | add, search |
| `memory-search-api` | RESTful search API | search, getAll |

## Environment Variables

### Required

- `MEM0_API_KEY` - Your Mem0 API key

### Optional

- `MEM0_ORG_ID` - Organization ID (for webhooks/projects)
- `MEM0_PROJECT_ID` - Project ID (for webhooks/projects)

## Publishing to JSR

```bash
# Validate
deno task all

# Publish
deno publish
```

## Project Structure

```
mem0-deno/
├── mod.ts              # SDK entry point
├── client.ts           # MemoryClient implementation
├── types.ts            # TypeScript definitions
├── error.ts            # APIError class
├── examples/           # Standalone examples
│   ├── 01_basic_usage.ts
│   ├── 02_memory_management.ts
│   ├── 03_user_operations.ts
│   ├── 04_batch_operations.ts
│   ├── 05_pagination.ts
│   └── 06_webhooks.ts
└── supabase/
    └── functions/      # Edge functions
        ├── chat-with-memory/
        └── memory-search-api/
```
