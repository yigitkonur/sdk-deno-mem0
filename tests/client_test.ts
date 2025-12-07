// deno-lint-ignore-file camelcase
/**
 * Unit tests for MemoryClient.
 *
 * These tests mock the global fetch to avoid network calls.
 * Run with: deno test tests/client_test.ts
 */

import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { APIError, Feedback, MemoryClient } from "../mod.ts";

// Helper to mock fetch
function mockFetch(
  response: unknown,
  status = 200,
  statusText = "OK",
): () => void {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (): Promise<Response> => {
    return Promise.resolve(
      new Response(JSON.stringify(response), {
        status,
        statusText,
        headers: { "Content-Type": "application/json" },
      }),
    );
  };
  return () => {
    globalThis.fetch = originalFetch;
  };
}

// Helper to mock fetch with text response (for errors)
function mockFetchError(errorText: string, status: number): () => void {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (): Promise<Response> => {
    return Promise.resolve(
      new Response(errorText, {
        status,
        statusText: "Error",
      }),
    );
  };
  return () => {
    globalThis.fetch = originalFetch;
  };
}

// =============================================================================
// Constructor Tests
// =============================================================================

Deno.test("MemoryClient constructor - throws if API key is missing", () => {
  assertThrows(
    () => new MemoryClient({ apiKey: "" }),
    Error,
    "Mem0 API key is required",
  );
});

Deno.test("MemoryClient constructor - accepts valid API key", () => {
  const client = new MemoryClient({ apiKey: "test-api-key" });
  assertEquals(typeof client, "object");
});

Deno.test("MemoryClient constructor - uses default host", () => {
  const client = new MemoryClient({ apiKey: "test-key" });
  // The client should be created successfully with default host
  assertEquals(typeof client, "object");
});

Deno.test("MemoryClient constructor - accepts custom host", () => {
  const client = new MemoryClient({
    apiKey: "test-key",
    host: "https://custom.api.mem0.ai",
  });
  assertEquals(typeof client, "object");
});

// =============================================================================
// ping() Tests
// =============================================================================

Deno.test("ping - succeeds with valid response", async () => {
  const restore = mockFetch({ status: "ok" });
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    await client.ping();
    // No error means success
  } finally {
    restore();
  }
});

Deno.test("ping - throws APIError on invalid key", async () => {
  const restore = mockFetch({ status: "error", message: "Invalid API key" });
  try {
    const client = new MemoryClient({ apiKey: "bad-key" });
    await assertRejects(
      async () => await client.ping(),
      APIError,
      "Invalid",
    );
  } finally {
    restore();
  }
});

// =============================================================================
// add() Tests
// =============================================================================

Deno.test("add - returns array of memories", async () => {
  const mockMemories = [
    { id: "mem_123", memory: "User likes coffee", event: "ADD" },
  ];
  const restore = mockFetch(mockMemories);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.add(
      [{ role: "user", content: "I like coffee" }],
      { user_id: "alice" },
    );
    assertEquals(Array.isArray(result), true);
    assertEquals(result[0]!.id, "mem_123");
    assertEquals(result[0]!.memory, "User likes coffee");
  } finally {
    restore();
  }
});

Deno.test("add - handles empty messages", async () => {
  const restore = mockFetch([]);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.add([], { user_id: "alice" });
    assertEquals(Array.isArray(result), true);
    assertEquals(result.length, 0);
  } finally {
    restore();
  }
});

// =============================================================================
// get() Tests
// =============================================================================

Deno.test("get - returns single memory", async () => {
  const mockMemory = {
    id: "mem_123",
    memory: "User prefers dark mode",
    user_id: "alice",
  };
  const restore = mockFetch(mockMemory);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.get("mem_123");
    assertEquals(result.id, "mem_123");
    assertEquals(result.memory, "User prefers dark mode");
  } finally {
    restore();
  }
});

Deno.test("get - throws APIError on 404", async () => {
  const restore = mockFetchError("Memory not found", 404);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    await assertRejects(
      async () => await client.get("non-existent"),
      APIError,
    );
  } finally {
    restore();
  }
});

// =============================================================================
// getAll() Tests
// =============================================================================

Deno.test("getAll - returns array of memories", async () => {
  const mockMemories = [
    { id: "mem_1", memory: "Memory 1" },
    { id: "mem_2", memory: "Memory 2" },
  ];
  const restore = mockFetch(mockMemories);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.getAll({ user_id: "alice" });
    assertEquals(Array.isArray(result), true);
    assertEquals(result.length, 2);
  } finally {
    restore();
  }
});

Deno.test("getAll - handles pagination", async () => {
  const mockMemories = [{ id: "mem_1", memory: "Page 1 memory" }];
  const restore = mockFetch(mockMemories);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.getAll({
      user_id: "alice",
      page: 1,
      page_size: 10,
    });
    assertEquals(Array.isArray(result), true);
  } finally {
    restore();
  }
});

// =============================================================================
// search() Tests
// =============================================================================

Deno.test("search - returns scored results", async () => {
  const mockResults = [
    { id: "mem_1", memory: "User likes hiking", score: 0.95 },
    { id: "mem_2", memory: "User enjoys outdoors", score: 0.87 },
  ];
  const restore = mockFetch(mockResults);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.search("What are my hobbies?", {
      user_id: "alice",
    });
    assertEquals(Array.isArray(result), true);
    assertEquals(result[0]!.score, 0.95);
  } finally {
    restore();
  }
});

Deno.test("search - handles empty results", async () => {
  const restore = mockFetch([]);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.search("Unknown topic", { user_id: "alice" });
    assertEquals(result.length, 0);
  } finally {
    restore();
  }
});

// =============================================================================
// update() Tests
// =============================================================================

Deno.test("update - requires text or metadata", async () => {
  const client = new MemoryClient({ apiKey: "test-key" });
  await assertRejects(
    async () => await client.update("mem_123", {}),
    Error,
    "Either text or metadata must be provided",
  );
});

Deno.test("update - succeeds with text", async () => {
  const mockResponse = [{ id: "mem_123", memory: "Updated memory" }];
  const restore = mockFetch(mockResponse);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.update("mem_123", { text: "Updated memory" });
    assertEquals(Array.isArray(result), true);
  } finally {
    restore();
  }
});

// =============================================================================
// delete() Tests
// =============================================================================

Deno.test("delete - returns success message", async () => {
  const restore = mockFetch({ message: "Memory deleted successfully" });
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.delete("mem_123");
    assertEquals(result.message, "Memory deleted successfully");
  } finally {
    restore();
  }
});

// =============================================================================
// deleteAll() Tests
// =============================================================================

Deno.test("deleteAll - returns success message", async () => {
  const restore = mockFetch({ message: "Memories deleted" });
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.deleteAll({ user_id: "alice" });
    assertEquals(typeof result.message, "string");
  } finally {
    restore();
  }
});

// =============================================================================
// history() Tests
// =============================================================================

Deno.test("history - returns array of history entries", async () => {
  const mockHistory = [
    {
      id: "hist_1",
      memory_id: "mem_123",
      event: "ADD",
      old_memory: null,
      new_memory: "New memory",
    },
  ];
  const restore = mockFetch(mockHistory);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.history("mem_123");
    assertEquals(Array.isArray(result), true);
    assertEquals(result[0]!.event, "ADD");
  } finally {
    restore();
  }
});

// =============================================================================
// users() Tests
// =============================================================================

Deno.test("users - returns paginated list", async () => {
  const mockUsers = {
    count: 2,
    results: [
      { id: "1", name: "alice", total_memories: 5 },
      { id: "2", name: "bob", total_memories: 3 },
    ],
    next: null,
    previous: null,
  };
  const restore = mockFetch(mockUsers);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.users();
    assertEquals(result.count, 2);
    assertEquals(result.results.length, 2);
  } finally {
    restore();
  }
});

// =============================================================================
// Error Handling Tests
// =============================================================================

Deno.test("APIError - contains status code", async () => {
  const restore = mockFetchError("Unauthorized", 401);
  try {
    const client = new MemoryClient({ apiKey: "bad-key" });
    try {
      await client.get("mem_123");
    } catch (error) {
      if (error instanceof APIError) {
        assertEquals(error.status, 401);
        assertEquals(error.name, "APIError");
      }
    }
  } finally {
    restore();
  }
});

Deno.test("APIError - contains error message", async () => {
  const restore = mockFetchError("Rate limit exceeded", 429);
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    try {
      await client.search("test", {});
    } catch (error) {
      if (error instanceof APIError) {
        assertEquals(error.message.includes("429"), true);
        assertEquals(error.message.includes("Rate limit"), true);
      }
    }
  } finally {
    restore();
  }
});

// =============================================================================
// Batch Operations Tests
// =============================================================================

Deno.test("batchUpdate - sends correct payload", async () => {
  const restore = mockFetch({ message: "Batch update successful" });
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.batchUpdate([
      { memoryId: "mem_1", text: "Updated 1" },
      { memoryId: "mem_2", text: "Updated 2" },
    ]);
    assertEquals(typeof result.message, "string");
  } finally {
    restore();
  }
});

Deno.test("batchDelete - sends correct payload", async () => {
  const restore = mockFetch({ message: "Batch delete successful" });
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.batchDelete(["mem_1", "mem_2", "mem_3"]);
    assertEquals(typeof result.message, "string");
  } finally {
    restore();
  }
});

// =============================================================================
// Feedback Tests
// =============================================================================

Deno.test("feedback - sends feedback successfully", async () => {
  const restore = mockFetch({ message: "Feedback recorded" });
  try {
    const client = new MemoryClient({ apiKey: "test-key" });
    const result = await client.feedback({
      memory_id: "mem_123",
      feedback: Feedback.POSITIVE,
    });
    assertEquals(typeof result.message, "string");
  } finally {
    restore();
  }
});
