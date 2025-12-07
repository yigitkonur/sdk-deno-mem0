/**
 * API Versions Example
 *
 * Demonstrates: v1 vs v2 API differences
 *
 * Run: deno run --allow-net --allow-env examples/07_api_versions.ts
 */

import { MemoryClient, API_VERSION } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });
const userId = `api_version_demo_${Date.now()}`;

console.log("🔄 Mem0 Deno SDK - API Versions Example\n");

// Create test memories
await client.add(
  [
    { role: "user", content: "I work as a software engineer" },
    { role: "user", content: "I live in San Francisco" },
    { role: "user", content: "I enjoy rock climbing" },
  ],
  { user_id: userId },
);

// 1. Using API v1 (default)
console.log("1️⃣  Using API v1 (query parameters)...");
const v1Results = await client.getAll({
  user_id: userId,
});
console.log(`✅ v1 returned ${v1Results.length} memories`);

// 2. Using API v2 (enhanced filtering)
console.log("\n2️⃣  Using API v2 (JSON body with filters)...");
const v2Results = await client.getAll({
  user_id: userId,
  api_version: API_VERSION.V2,
  filters: {
    user_id: userId,
  },
});
console.log(`✅ v2 returned ${v2Results.length} memories`);

// 3. v2 Search with advanced filters
console.log("\n3️⃣  v2 search with OR filters...");
const searchResults = await client.search("What do you know about me?", {
  api_version: "v2",
  filters: {
    OR: [
      { user_id: userId },
      { agent_id: "assistant" },
    ],
  },
  threshold: 0.5,
});

console.log(`✅ Found ${searchResults.length} memories`);
for (const result of searchResults) {
  const content = result.data?.memory || result.memory;
  console.log(`   - ${content} (score: ${result.score?.toFixed(2)})`);
}

// Clean up
await client.deleteAll({ user_id: userId });
console.log("\n✨ API versions example complete!");
console.log("💡 v2 provides more powerful filtering with OR/AND logic");
