/**
 * Pagination Example
 *
 * Demonstrates: getAll() with page and page_size parameters
 *
 * Run: deno run --allow-net --allow-env examples/05_pagination.ts
 */

import { MemoryClient } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });
const userId = `pagination_demo_${Date.now()}`;

console.log("📄 Mem0 Deno SDK - Pagination Example\n");

// 1. Create many memories
console.log("1️⃣  Creating 15 memories...");
const conversations = [
  "I love coffee in the morning",
  "I prefer tea in the afternoon",
  "I enjoy reading sci-fi novels",
  "I like watching documentaries",
  "I practice yoga daily",
  "I play guitar on weekends",
  "I'm learning Spanish",
  "I enjoy cooking Italian food",
  "I prefer working from home",
  "I like early morning runs",
  "I collect vintage watches",
  "I enjoy photography",
  "I'm a vegetarian",
  "I love traveling to Japan",
  "I prefer minimalist design",
];

for (const content of conversations) {
  await client.add(
    [{ role: "user", content }],
    { user_id: userId },
  );
}
console.log(`✅ Created 15 memories`);

// 2. Get all memories (no pagination)
console.log("\n2️⃣  Getting all memories without pagination...");
const allMemories = await client.getAll({ user_id: userId });
console.log(`✅ Total memories: ${allMemories.length}`);

// 3. Get first page
console.log("\n3️⃣  Getting page 1 (5 per page)...");
const page1 = await client.getAll({
  user_id: userId,
  page: 1,
  page_size: 5,
});

console.log(`✅ Page 1 has ${page1.length} memories:`);
for (const mem of page1) {
  console.log(`   - ${mem.memory}`);
}

// 4. Get second page
console.log("\n4️⃣  Getting page 2...");
const page2 = await client.getAll({
  user_id: userId,
  page: 2,
  page_size: 5,
});

console.log(`✅ Page 2 has ${page2.length} memories:`);
for (const mem of page2) {
  console.log(`   - ${mem.memory}`);
}

// 5. Get third page
console.log("\n5️⃣  Getting page 3...");
const page3 = await client.getAll({
  user_id: userId,
  page: 3,
  page_size: 5,
});

console.log(`✅ Page 3 has ${page3.length} memories:`);
for (const mem of page3) {
  console.log(`   - ${mem.memory}`);
}

// 6. Clean up
console.log("\n6️⃣  Cleaning up...");
await client.deleteAll({ user_id: userId });
console.log(`✅ Deleted all ${allMemories.length} memories`);

console.log("\n✨ Pagination example complete!");
console.log("💡 Use pagination for large datasets to improve performance");
