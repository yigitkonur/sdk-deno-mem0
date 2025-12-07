# Node → Deno Mapping: Detailed Conversion Table

**Date:** 2025-12-07
**Purpose:** Line-by-line mapping of Node.js patterns to Deno equivalents

---

## Critical Conversions (Must Change)

### 1. Axios Import Removal

**Source:** `mem0.ts:1`

```typescript
// Node.js (REMOVE)
import axios from "axios";
```

**Deno:**

```typescript
// No import needed - fetch is global
```

---

### 2. Axios Instance Creation

**Source:** `mem0.ts:95-99`

```typescript
// Node.js (REMOVE)
this.client = axios.create({
  baseURL: this.host,
  headers: { Authorization: `Token ${this.apiKey}` },
  timeout: 60000,
});
```

**Deno:**

```typescript
// No client instance needed
// Timeout handled per-request with AbortSignal
private readonly timeout = 60000;
```

---

### 3. Axios DELETE with Params

**Source:** `mem0.ts:528-533`

```typescript
// Node.js (axios)
await this.client.delete(
  `/v2/entities/${entity.type}/${entity.name}/`,
  { params: requestOptions },
);
```

**Deno:**

```typescript
// Native fetch with URLSearchParams
const params = new URLSearchParams();
Object.entries(requestOptions).forEach(([key, val]) => {
  if (val != null) params.append(key, String(val));
});
const url = `${this.#baseUrl}/v2/entities/${entity.type}/${entity.name}/?${params}`;
await this.#fetchWithErrorHandling(url, {
  method: "DELETE",
  headers: this.#headers,
});
```

---

### 4. Process.env Access

**Source:** `telemetry.ts:8-10`

```typescript
// Node.js
let MEM0_TELEMETRY = true;
try {
  MEM0_TELEMETRY = process?.env?.MEM0_TELEMETRY === "false" ? false : true;
} catch (error) {}
```

**Deno:**

```typescript
// Deno (opt-in instead of opt-out)
function isTelemetryEnabled(): boolean {
  try {
    return Deno.env.get("MEM0_TELEMETRY") === "true";
  } catch {
    return false; // Default: disabled
  }
}
```

---

### 5. Class Property Types

**Source:** `mem0.ts:45`

```typescript
// Node.js (any type)
client: any;
```

**Deno:**

```typescript
// Remove entirely - not using axios client
// Or if needed for something else:
// client: unknown;
```

---

## Type Annotation Additions (JSR Requirement)

### Methods Needing Explicit Return Types

| Method                    | Current                                      | Required                             |
| ------------------------- | -------------------------------------------- | ------------------------------------ |
| `constructor`             | implicit                                     | N/A (constructors)                   |
| `_validateApiKey`         | implicit `any`                               | `: void`                             |
| `_validateOrgProject`     | `: void`                                     | ✓ Already explicit                   |
| `_initializeClient`       | implicit                                     | `: Promise<void>`                    |
| `_captureEvent`           | implicit                                     | `: void`                             |
| `_fetchWithErrorHandling` | `: Promise<any>`                             | `: Promise<unknown>`                 |
| `_preparePayload`         | `: object`                                   | `: Record<string, unknown>`          |
| `_prepareParams`          | `: object`                                   | `: Record<string, string>`           |
| `ping`                    | `: Promise<void>`                            | ✓ Already explicit                   |
| `add`                     | `: Promise<Array<Memory>>`                   | ✓ Already explicit                   |
| `update`                  | `: Promise<Array<Memory>>`                   | ✓ Already explicit                   |
| `get`                     | `: Promise<Memory>`                          | ✓ Already explicit                   |
| `getAll`                  | `: Promise<Array<Memory>>`                   | ✓ Already explicit                   |
| `search`                  | `: Promise<Array<Memory>>`                   | ✓ Already explicit                   |
| `delete`                  | `: Promise<{ message: string }>`             | ✓ Already explicit                   |
| `deleteAll`               | `: Promise<{ message: string }>`             | ✓ Already explicit                   |
| `history`                 | `: Promise<Array<MemoryHistory>>`            | ✓ Already explicit                   |
| `users`                   | `: Promise<AllUsers>`                        | ✓ Already explicit                   |
| `deleteUser`              | `: Promise<{ message: string }>`             | ✓ Already explicit                   |
| `deleteUsers`             | `: Promise<{ message: string }>`             | ✓ Already explicit                   |
| `batchUpdate`             | `: Promise<string>`                          | `: Promise<{ message: string }>`     |
| `batchDelete`             | `: Promise<string>`                          | `: Promise<{ message: string }>`     |
| `getProject`              | `: Promise<ProjectResponse>`                 | ✓ Already explicit                   |
| `updateProject`           | `: Promise<Record<string, any>>`             | `: Promise<Record<string, unknown>>` |
| `getWebhooks`             | `: Promise<Array<Webhook>>`                  | ✓ Already explicit                   |
| `createWebhook`           | `: Promise<Webhook>`                         | ✓ Already explicit                   |
| `updateWebhook`           | `: Promise<{ message: string }>`             | ✓ Already explicit                   |
| `deleteWebhook`           | `: Promise<{ message: string }>`             | ✓ Already explicit                   |
| `feedback`                | `: Promise<{ message: string }>`             | ✓ Already explicit                   |
| `createMemoryExport`      | `: Promise<{ message: string; id: string }>` | ✓ Already explicit                   |
| `getMemoryExport`         | `: Promise<{ message: string; id: string }>` | ✓ Already explicit                   |

---

## JSDoc Documentation Additions

### Template for Each Method

````typescript
/**
 * Brief description of what the method does.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws {APIError} When the API returns a non-OK response
 * @example
 * ```ts
 * const client = new MemoryClient({ apiKey: "your-key" });
 * const result = await client.methodName("param");
 * console.log(result);
 * ```
 */
````

### Example: add() Method

````typescript
/**
 * Adds new memories from conversation messages.
 * 
 * @param messages - Array of conversation messages with role and content
 * @param options - Optional parameters including user_id, agent_id, metadata
 * @returns Array of created Memory objects with IDs
 * @throws {APIError} When the API returns a non-OK response
 * @example
 * ```ts
 * const memories = await client.add(
 *   [{ role: "user", content: "I like coffee" }],
 *   { user_id: "alice" }
 * );
 * console.log(memories[0].id);
 * ```
 */
async add(
  messages: Array<Message>,
  options: MemoryOptions = {},
): Promise<Array<Memory>> {
  // ...
}
````

---

## Import/Export Restructure

### From (Node/index.ts)

```typescript
import { MemoryClient } from "./mem0";
import type * as MemoryTypes from "./mem0.types";

export type { MemoryOptions, Memory, ... } from "./mem0.types";
export { MemoryClient };
export default MemoryClient;
```

### To (Deno/mod.ts)

````typescript
/**
 * @module
 * Deno SDK for Mem0 Cloud API - The Memory Layer for AI Apps.
 *
 * @example
 * ```ts
 * import { MemoryClient } from "@mem0/deno";
 *
 * const client = new MemoryClient({ apiKey: Deno.env.get("MEM0_API_KEY")! });
 *
 * await client.add(
 *   [{ role: "user", content: "My name is Alice" }],
 *   { user_id: "alice" }
 * );
 *
 * const memories = await client.search("What is my name?", { user_id: "alice" });
 * console.log(memories);
 * ```
 */

export { MemoryClient } from "./client.ts";
export { APIError } from "./error.ts";

export type {
  AllUsers,
  CreateMemoryExportPayload,
  FeedbackPayload,
  GetMemoryExportPayload,
  Memory,
  MemoryHistory,
  MemoryOptions,
  MemoryUpdateBody,
  Message,
  Messages,
  MultiModalMessages,
  ProjectOptions,
  ProjectResponse,
  PromptUpdatePayload,
  SearchOptions,
  User,
  Webhook,
  WebhookPayload,
} from "./types.ts";

export { API_VERSION, Feedback, OutputFormat } from "./types.ts";
````

---

## Error Handling Restructure

### From (embedded in mem0.ts)

```typescript
class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "APIError";
  }
}
```

### To (Deno/error.ts)

```typescript
/**
 * Custom error class for API-related errors.
 * Captures HTTP status code and error message for debugging.
 */
export class APIError extends Error {
  /** HTTP status code from the API response */
  readonly status: number;

  /**
   * Creates a new APIError instance.
   *
   * @param status - HTTP status code
   * @param message - Error message from API or generated
   */
  constructor(status: number, message: string) {
    super(`API request failed with status ${status}: ${message}`);
    this.name = "APIError";
    this.status = status;
  }
}
```

---

## Fetch Wrapper Enhancement

### From (mem0.ts:147-162)

```typescript
async _fetchWithErrorHandling(url: string, options: any): Promise<any> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Token ${this.apiKey}`,
      "Mem0-User-ID": this.telemetryId,
    },
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new APIError(`API request failed: ${errorData}`);
  }
  const jsonResponse = await response.json();
  return jsonResponse;
}
```

### To (Deno/client.ts)

```typescript
/**
 * Makes an HTTP request with error handling and timeout.
 * 
 * @param url - Full URL to request
 * @param options - Fetch options including method, headers, body
 * @returns Parsed JSON response
 * @throws {APIError} When the API returns a non-OK response
 * @throws {Error} When request times out
 */
async #fetchWithErrorHandling(
  url: string,
  options: RequestInit = {},
): Promise<unknown> {
  const signal = AbortSignal.timeout(this.#timeout);
  
  const response = await fetch(url, {
    ...options,
    signal,
    headers: {
      ...this.#headers,
      ...options.headers,
    },
  }).catch((error: unknown) => {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${this.#timeout}ms for ${url}`);
    }
    throw error;
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(response.status, errorText || response.statusText);
  }
  
  return response.json();
}
```

---

## Permissions Documentation

### Required Deno Permissions

| Permission  | Flag                         | When Needed       |
| ----------- | ---------------------------- | ----------------- |
| Network     | `--allow-net=api.mem0.ai`    | All API calls     |
| Environment | `--allow-env=MEM0_API_KEY`   | Auto-read API key |
| Environment | `--allow-env=MEM0_TELEMETRY` | Enable telemetry  |

### Recommended deno.json tasks

```json
{
  "tasks": {
    "dev": "deno run --allow-net --allow-env example.ts",
    "test": "deno test --allow-net --allow-env",
    "lint": "deno lint",
    "fmt": "deno fmt",
    "check": "deno check mod.ts",
    "doc": "deno doc --lint mod.ts"
  }
}
```
