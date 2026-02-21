/**
 * Basic Usage Example
 *
 * Demonstrates: add(), get(), search() methods
 *
 * Run: deno run --allow-net --allow-env examples/01_basic_usage.ts
 */

// Local import (before publishing)
import { MemoryClient } from "../mod.ts";
// After publishing to JSR:
// import { MemoryClient } from "@yigitkonur/sdk-deno-mem0";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY environment variable is required");
  console.log("Set it with: export MEM0_API_KEY=your-api-key");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });

console.log("🚀 Mem0 Deno SDK - Basic Usage Example\n");

// 1. Add memories from a conversation
console.log("1️⃣  Adding memories from conversation...");
const memories = await client.add(
  [
    {
      role: "user",
      content: "Hi! My name is Alice and I'm a software engineer from San Francisco.",
    },
    {
      role: "assistant",
      content: "Nice to meet you, Alice! Welcome!",
    },
    {
      role: "user",
      content: "I love hiking on weekends and I'm learning Deno.",
    },
    {
      role: "assistant",
      content: "That's great! Deno is an excellent runtime.",
    },
  ],
  {
    user_id: "alice_demo",
    metadata: { source: "demo", timestamp: Date.now() },
  },
);

console.log(`✅ Created ${memories.length} memories`);
for (const memory of memories) {
  const memText = memory.data?.memory || memory.memory || "N/A";
  console.log(`   - ${memory.id}: ${memText}`);
}

// 2. Get a specific memory
if (memories.length > 0 && memories[0]!.id) {
  console.log("\n2️⃣  Retrieving first memory by ID...");
  const memoryId = memories[0]!.id;
  const retrieved = await client.get(memoryId);
  const retrievedText = retrieved.data?.memory || retrieved.memory || "N/A";
  console.log(`✅ Retrieved: ${retrievedText}`);
  console.log(`   User: ${retrieved.user_id}`);
  console.log(`   Created: ${retrieved.created_at}`);
}

// 3. Search memories
console.log("\n3️⃣  Searching memories...");
const searchResults = await client.search("What are Alice's hobbies?", {
  user_id: "alice_demo",
  limit: 5,
});

console.log(`✅ Found ${searchResults.length} relevant memories:`);
for (const result of searchResults) {
  console.log(`   - ${result.memory} (score: ${result.score?.toFixed(2)})`);
}

// 4. Search for professional info
console.log("\n4️⃣  Searching for professional information...");
const profResults = await client.search("What does Alice do for work?", {
  user_id: "alice_demo",
});

console.log(`✅ Found ${profResults.length} results:`);
for (const result of profResults) {
  console.log(`   - ${result.memory}`);
}

console.log("\n✨ Basic usage example complete!");
console.log("💡 Tip: Check other examples for advanced features");
