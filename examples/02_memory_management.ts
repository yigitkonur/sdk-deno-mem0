/**
 * Memory Management Example
 *
 * Demonstrates: update(), delete(), deleteAll(), history() methods
 *
 * Run: deno run --allow-net --allow-env examples/02_memory_management.ts
 */

import { MemoryClient } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });
const userId = `demo_user_${Date.now()}`;

console.log("🔧 Mem0 Deno SDK - Memory Management Example\n");

// 1. Create a memory to manage
console.log("1️⃣  Creating initial memory...");
const [memory] = await client.add(
  [
    {
      role: "user",
      content: "I prefer light mode for coding during the day.",
    },
  ],
  { user_id: userId },
);

console.log(`✅ Created memory: ${memory!.id}`);
console.log(`   Content: ${memory!.memory}`);

const memoryId = memory!.id;

// 2. Update the memory
console.log("\n2️⃣  Updating memory...");
const updated = await client.update(memoryId, {
  text: "I prefer dark mode for coding at all times.",
  metadata: { updated_at: new Date().toISOString(), reason: "preference_change" },
});

console.log(`✅ Updated memory`);
console.log(`   New content: ${updated[0]?.memory}`);

// 3. View memory history
console.log("\n3️⃣  Viewing memory history...");
const historyEntries = await client.history(memoryId);

console.log(`✅ Found ${historyEntries.length} history entries:`);
for (const entry of historyEntries) {
  console.log(`   - Event: ${entry.event}`);
  console.log(`     Old: ${entry.old_memory}`);
  console.log(`     New: ${entry.new_memory}`);
  console.log(`     Date: ${entry.created_at}`);
}

// 4. Get all memories for user
console.log("\n4️⃣  Getting all memories for user...");
const allMemories = await client.getAll({ user_id: userId });
console.log(`✅ User has ${allMemories.length} total memories`);

// 5. Delete specific memory
console.log("\n5️⃣  Deleting specific memory...");
const deleteResult = await client.delete(memoryId);
console.log(`✅ ${deleteResult.message}`);

// 6. Verify deletion
console.log("\n6️⃣  Verifying deletion...");
const remainingMemories = await client.getAll({ user_id: userId });
console.log(`✅ Remaining memories: ${remainingMemories.length}`);

// 7. Clean up - delete all memories for demo user
console.log("\n7️⃣  Cleaning up demo user...");
await client.deleteAll({ user_id: userId });
console.log(`✅ All demo memories deleted`);

console.log("\n✨ Memory management example complete!");
