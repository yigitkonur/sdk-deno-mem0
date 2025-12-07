/**
 * Batch Operations Example
 *
 * Demonstrates: batchUpdate(), batchDelete() methods
 *
 * Run: deno run --allow-net --allow-env examples/04_batch_operations.ts
 */

import { MemoryClient } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });
const userId = `batch_demo_${Date.now()}`;

console.log("📦 Mem0 Deno SDK - Batch Operations Example\n");

// 1. Create multiple memories
console.log("1️⃣  Creating multiple memories...");
const memories = await client.add(
  [
    { role: "user", content: "I like Python for data science." },
    { role: "user", content: "I prefer TypeScript for web development." },
    { role: "user", content: "I use Rust for systems programming." },
    { role: "user", content: "I'm learning Go for backend services." },
  ],
  { user_id: userId },
);

console.log(`✅ Created ${memories.length} memories`);
const memoryIds = memories.map((m) => m.id);

// 2. Batch update multiple memories
console.log("\n2️⃣  Batch updating memories...");
const updatePayload = [
  {
    memoryId: memoryIds[0]!,
    text: "I love Python for data science and machine learning.",
  },
  {
    memoryId: memoryIds[1]!,
    text: "I prefer TypeScript for full-stack web development.",
  },
];

const updateResult = await client.batchUpdate(updatePayload);
console.log(`✅ ${updateResult.message}`);

// 3. Verify updates
console.log("\n3️⃣  Verifying updates...");
for (const payload of updatePayload) {
  const updated = await client.get(payload.memoryId);
  console.log(`   - ${updated.id}: ${updated.memory}`);
}

// 4. Batch delete memories
console.log("\n4️⃣  Batch deleting memories...");
const deleteIds = [memoryIds[2]!, memoryIds[3]!];
const deleteResult = await client.batchDelete(deleteIds);
console.log(`✅ ${deleteResult.message}`);

// 5. Check remaining memories
console.log("\n5️⃣  Checking remaining memories...");
const remaining = await client.getAll({ user_id: userId });
console.log(`✅ Remaining memories: ${remaining.length}`);
for (const mem of remaining) {
  console.log(`   - ${mem.memory}`);
}

// 6. Clean up
console.log("\n6️⃣  Cleaning up...");
await client.deleteAll({ user_id: userId });
console.log(`✅ Cleanup complete`);

console.log("\n✨ Batch operations example complete!");
console.log("💡 Batch operations are efficient for bulk updates/deletes");
