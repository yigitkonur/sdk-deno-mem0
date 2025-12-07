/**
 * @module
 * Deno SDK for Mem0 Cloud API - The Memory Layer for AI Apps.
 *
 * This SDK provides a client for interacting with the Mem0 Cloud API,
 * enabling you to store, retrieve, and search memories for AI applications.
 *
 * ## Installation
 *
 * ```bash
 * # Using deno.land/x
 * import { MemoryClient } from "https://deno.land/x/mem0_deno_sdk/mod.ts";
 *
 * # Or add to your imports in deno.json
 * ```
 *
 * ## Quick Start
 *
 * ```ts
 * import { MemoryClient } from "mem0-deno-sdk";
 *
 * // Initialize the client
 * const client = new MemoryClient({
 *   apiKey: Deno.env.get("MEM0_API_KEY")!
 * });
 *
 * // Add a memory from conversation
 * const memories = await client.add(
 *   [
 *     { role: "user", content: "My name is Alice and I love hiking." },
 *     { role: "assistant", content: "Nice to meet you, Alice!" }
 *   ],
 *   { user_id: "alice" }
 * );
 *
 * // Search memories
 * const results = await client.search("What are Alice's hobbies?", {
 *   user_id: "alice"
 * });
 *
 * console.log(results[0].memory); // "Alice loves hiking"
 * ```
 *
 * ## Supabase Edge Functions
 *
 * This SDK is fully compatible with Supabase Edge Functions:
 *
 * ```ts
 * import { MemoryClient } from "https://deno.land/x/mem0_deno_sdk/mod.ts";
 *
 * const client = new MemoryClient({
 *   apiKey: Deno.env.get("MEM0_API_KEY")!
 * });
 *
 * Deno.serve(async (req) => {
 *   const { messages, userId } = await req.json();
 *   await client.add(messages, { user_id: userId });
 *   return new Response("OK");
 * });
 * ```
 *
 * ## Permissions
 *
 * When running with Deno, the SDK requires:
 * - `--allow-net` for API calls
 * - `--allow-env` if reading API key from environment
 */

// Export the main client class
export { MemoryClient } from "./client.ts";

// Export the error class for error handling
export { APIError } from "./error.ts";

// Export all types for TypeScript users
export type {
  AllUsers,
  ClientOptions,
  CreateMemoryExportPayload,
  CustomCategory,
  ExportCommon,
  FeedbackPayload,
  GetMemoryExportPayload,
  Memory,
  MemoryData,
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

// Export enums as values (not just types)
export { API_VERSION, Feedback, OutputFormat } from "./types.ts";
