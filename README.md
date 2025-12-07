# mem0-deno-sdk

Deno SDK for [Mem0](https://mem0.ai) Cloud API - The Memory Layer for AI Apps.

[![JSR](https://jsr.io/badges/@mem0/deno)](https://jsr.io/@mem0/deno)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

## Features

- 🦕 **Native Deno** - Built for Deno runtime with TypeScript-first approach
- ⚡ **Edge Ready** - Works seamlessly with Supabase Edge Functions and Deno Deploy
- 🔒 **Secure** - Uses private class fields, no telemetry by default
- 📦 **Zero Dependencies** - Only uses Web standard APIs (fetch, URL, etc.)
- 📝 **Fully Typed** - Complete TypeScript definitions with JSDoc documentation

## Installation

### From deno.land/x

```typescript
import { MemoryClient } from "https://deno.land/x/mem0_deno_sdk/mod.ts";
```

### From JSR (recommended)

```bash
deno add @mem0/deno
```

```typescript
import { MemoryClient } from "@mem0/deno";
```

## Quick Start

```typescript
import { MemoryClient } from "https://deno.land/x/mem0_deno_sdk/mod.ts";

// Initialize the client
const client = new MemoryClient({
  apiKey: Deno.env.get("MEM0_API_KEY")!,
});

// Add memories from a conversation
const memories = await client.add(
  [
    { role: "user", content: "My name is Alice and I love hiking in the mountains." },
    { role: "assistant", content: "Nice to meet you, Alice! Mountain hiking sounds amazing." },
  ],
  { user_id: "alice" },
);

console.log(`Created ${memories.length} memories`);

// Search memories
const results = await client.search("What are Alice's hobbies?", {
  user_id: "alice",
  limit: 5,
});

for (const memory of results) {
  console.log(`- ${memory.memory} (score: ${memory.score})`);
}
```

## API Reference

### MemoryClient

The main client for interacting with the Mem0 API.

#### Constructor

```typescript
const client = new MemoryClient({
  apiKey: string,           // Required: Your Mem0 API key
  host?: string,            // Optional: API base URL (default: https://api.mem0.ai)
  organizationId?: string,  // Optional: Organization ID
  projectId?: string,       // Optional: Project ID
});
```

#### Memory Operations

| Method                   | Description                             |
| ------------------------ | --------------------------------------- |
| `add(messages, options)` | Add memories from conversation messages |
| `get(memoryId)`          | Retrieve a specific memory by ID        |
| `getAll(options)`        | List all memories matching filters      |
| `search(query, options)` | Semantic search across memories         |
| `update(memoryId, data)` | Update a memory's text or metadata      |
| `delete(memoryId)`       | Delete a specific memory                |
| `deleteAll(options)`     | Delete all memories matching filters    |
| `history(memoryId)`      | Get change history for a memory         |

#### User/Entity Operations

| Method                | Description                           |
| --------------------- | ------------------------------------- |
| `users()`             | List all users/entities with memories |
| `deleteUsers(params)` | Delete users/entities by ID           |

#### Batch Operations

| Method                   | Description                      |
| ------------------------ | -------------------------------- |
| `batchUpdate(memories)`  | Update multiple memories at once |
| `batchDelete(memoryIds)` | Delete multiple memories at once |

#### Project & Webhook Operations

| Method                   | Description               |
| ------------------------ | ------------------------- |
| `getProject(options)`    | Get project configuration |
| `updateProject(prompts)` | Update project settings   |
| `getWebhooks()`          | List all webhooks         |
| `createWebhook(webhook)` | Create a new webhook      |
| `updateWebhook(webhook)` | Update a webhook          |
| `deleteWebhook(data)`    | Delete a webhook          |

#### Other Operations

| Method                     | Description                 |
| -------------------------- | --------------------------- |
| `ping()`                   | Check API connectivity      |
| `feedback(data)`           | Submit feedback on a memory |
| `createMemoryExport(data)` | Start a memory export job   |
| `getMemoryExport(data)`    | Retrieve an export          |

## Supabase Edge Functions

This SDK is fully compatible with Supabase Edge Functions:

```typescript
// supabase/functions/fetch_user_data/index.ts
import { MemoryClient } from "https://deno.land/x/mem0_deno_sdk/mod.ts";

const client = new MemoryClient({
  apiKey: Deno.env.get("MEM0_API_KEY")!
});

Deno.serve(async (req) => {
  const { messages, userId } = await req.json();
  await client.add(messages, { user_id: userId });
  return new Response("OK");
});
```

**Deploy to Supabase:**

```bash
# Link your project
supabase link --project-ref your-project-ref

# Set secret
supabase secrets set MEM0_API_KEY=your-api-key

# Deploy function
supabase functions deploy your-function-name --no-verify-jwt

# Test
curl -X POST https://your-project.supabase.co/functions/v1/your-function-name \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice","message":"Hello!"}'
```

See `supabase/functions/` for production-ready examples.

## Permissions

When running with Deno CLI, this SDK requires:

| Permission  | Flag                       | Purpose               |
| ----------- | -------------------------- | --------------------- |
| Network     | `--allow-net=api.mem0.ai`  | API calls to Mem0     |
| Environment | `--allow-env=MEM0_API_KEY` | Read API key from env |

Example:

```bash
deno run --allow-net=api.mem0.ai --allow-env=MEM0_API_KEY your-script.ts
```

## Error Handling

The SDK throws `APIError` for API-related errors:

```typescript
import { APIError, MemoryClient } from "https://deno.land/x/mem0_deno_sdk/mod.ts";

try {
  const memory = await client.get("non-existent-id");
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error ${error.status}: ${error.message}`);
  }
}
```

## Types

All types are exported for TypeScript users:

```typescript
import type {
  AllUsers,
  Memory,
  MemoryOptions,
  Message,
  SearchOptions,
  User,
} from "https://deno.land/x/mem0_deno_sdk/mod.ts";
```

## Differences from Node.js SDK

| Feature         | Node.js SDK        | Deno SDK            |
| --------------- | ------------------ | ------------------- |
| HTTP Client     | axios              | Native fetch        |
| Timeouts        | axios timeout      | AbortSignal.timeout |
| Telemetry       | Enabled by default | None                |
| Package Manager | npm                | deno.land/x or JSR  |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## Links

- [Mem0 Documentation](https://docs.mem0.ai)
- [Mem0 API Reference](https://docs.mem0.ai/api-reference)
- [Mem0 Platform](https://app.mem0.ai)
