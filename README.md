Deno SDK for the Mem0 cloud API. stores, retrieves, and semantically searches memories for AI apps. single class, zero runtime dependencies, works on Supabase Edge Functions out of the box.

```ts
const client = new MemoryClient({ apiKey: Deno.env.get("MEM0_API_KEY")! });

await client.add(
  [{ role: "user", content: "I prefer TypeScript over JavaScript" }],
  { user_id: "alice" }
);

const results = await client.search("what languages does the user like?", {
  user_id: "alice",
});
```

[![deno](https://img.shields.io/badge/deno-2.x-93450a.svg?style=flat-square)](https://deno.land/)
[![JSR](https://img.shields.io/badge/JSR-@yigitkonur/mem0--deno--sdk-93450a.svg?style=flat-square)](https://jsr.io/@yigitkonur/mem0-deno-sdk)
[![license](https://img.shields.io/badge/license-Apache_2.0-grey.svg?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0)

---

## what it does

all memory extraction and semantic search happens server-side on Mem0. this SDK just talks to their REST API cleanly.

- **add memories** — feed conversation messages, Mem0 extracts facts
- **semantic search** — query memories by meaning, not keywords
- **v1 and v2 API support** — v2 adds compound filters with `OR`/`AND` logic
- **pagination** — `page` and `page_size` on `getAll` and `search`
- **batch operations** — update or delete multiple memories in one call
- **webhooks** — create, update, delete, list webhook endpoints
- **project management** — read/update project settings and prompts
- **memory export** — bulk export with filters and schema
- **feedback** — positive/negative signals on memory quality
- **60s request timeout** — `AbortSignal` on every fetch, timeout errors wrapped cleanly

zero runtime dependencies. only uses Deno built-ins (`fetch`, `AbortSignal`, `URLSearchParams`).

## install

```ts
import { MemoryClient } from "jsr:@yigitkonur/mem0-deno-sdk";
```

or add to `deno.json`:

```json
{
  "imports": {
    "mem0": "jsr:@yigitkonur/mem0-deno-sdk"
  }
}
```

requires Deno 2.x. permissions: `--allow-net` and `--allow-env` (if reading API key from env).

## usage

### store conversation turns

```ts
await client.add(
  [
    { role: "user", content: "I'm working on a Rust project" },
    { role: "assistant", content: "nice, what kind of project?" },
  ],
  { user_id: "alice", metadata: { source: "onboarding" } }
);
```

### search memories

```ts
const results = await client.search("what is the user working on?", {
  user_id: "alice",
  limit: 5,
  threshold: 0.7,
});
```

### v2 compound filters

```ts
import { API_VERSION } from "jsr:@yigitkonur/mem0-deno-sdk";

const results = await client.search("preferences", {
  api_version: API_VERSION.V2,
  filters: {
    OR: [{ user_id: "alice" }, { agent_id: "support-bot" }],
  },
});
```

### get, update, delete

```ts
const memory = await client.get("memory-id");
await client.update("memory-id", { text: "corrected fact" });
await client.delete("memory-id");
await client.deleteAll({ user_id: "alice" });
```

### batch operations

```ts
await client.batchUpdate([
  { memory_id: "id-1", text: "updated text" },
  { memory_id: "id-2", text: "also updated" },
]);

await client.batchDelete(["id-1", "id-2"]);
```

### history and users

```ts
const history = await client.history("memory-id");
const users = await client.users();
await client.deleteUsers();
```

### webhooks

```ts
const hooks = await client.getWebhooks();
await client.createWebhook({ url: "https://example.com/hook", event_type: "memory.add" });
```

### supabase edge function

```ts
import { MemoryClient } from "jsr:@yigitkonur/mem0-deno-sdk";

const mem0 = new MemoryClient({ apiKey: Deno.env.get("MEM0_API_KEY")! });

Deno.serve(async (req) => {
  const { userId, message } = await req.json();
  const memories = await mem0.search(message, { user_id: userId, limit: 3 });
  await mem0.add([{ role: "user", content: message }], { user_id: userId });
  return new Response(JSON.stringify({ memories }));
});
```

## configuration

### client options

| option | type | required | default | description |
|:---|:---|:---|:---|:---|
| `apiKey` | `string` | yes | — | Mem0 API key. validated on construction |
| `host` | `string` | no | `https://api.mem0.ai` | override base URL |
| `organizationId` | `string` | no | — | required for project/webhook methods |
| `projectId` | `string` | no | — | required for project/webhook methods |

timeout is hardcoded at 60s. auth header format is `Token {apiKey}` (Django REST Framework style).

### memory options

commonly used fields when calling `add`, `getAll`, `search`, `deleteAll`:

| field | description |
|:---|:---|
| `user_id` | scope to a specific user |
| `agent_id` | scope to a specific agent |
| `run_id` | scope to a specific run/session |
| `api_version` | `"v1"` or `"v2"` — v2 enables JSON body filters |
| `metadata` | arbitrary key-value pairs attached to memories |
| `filters` | v2 compound filters (`AND`/`OR` logic) |
| `page` / `page_size` | pagination |
| `output_format` | `"v1.0"` or `"v1.1"` response format |

### search-specific options

| field | description |
|:---|:---|
| `limit` | max results |
| `threshold` | similarity score cutoff |
| `top_k` | top-k retrieval |
| `keyword_search` | enable keyword-based search |
| `rerank` | re-rank results |
| `categories` | filter by memory categories |

## error handling

```ts
import { MemoryClient, APIError } from "jsr:@yigitkonur/mem0-deno-sdk";

try {
  await client.get("nonexistent-id");
} catch (error) {
  if (error instanceof APIError) {
    console.log(error.status);  // 404
    console.log(error.message); // "API request failed with status 404: Not found"
  }
}
```

validation errors (bad API key, missing required fields) throw plain `Error` before any HTTP call. HTTP failures throw `APIError` with `.status` and `.message`. timeouts throw `Error` with `"Request timeout after 60000ms for {url}"`.

## project structure

```
mod.ts              — public entry point, re-exports everything
client.ts           — MemoryClient class, all API logic
types.ts            — interfaces, enums (API_VERSION, OutputFormat, Feedback)
error.ts            — APIError class
tests/
  client_test.ts    — unit tests with mocked fetch
examples/
  01-10             — usage examples covering every API method
supabase/
  functions/        — two working Supabase Edge Function examples
```

## tests

```bash
deno test
```

all tests mock `globalThis.fetch` — no real network calls. covers constructor validation, all CRUD methods, batch operations, pagination, error handling, and APIError shape.

## license

Apache 2.0
