/**
 * Complete Workflow Example
 *
 * Demonstrates: Full lifecycle of memory management
 *
 * Run: deno run --allow-net --allow-env examples/10_complete_workflow.ts
 */

import { MemoryClient } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });
const userId = `workflow_demo_${Date.now()}`;

console.log("🔄 Mem0 Deno SDK - Complete Workflow Example\n");
console.log(`User ID: ${userId}\n`);

// Step 1: Onboarding - Collect user preferences
console.log("📝 Step 1: User Onboarding");
const onboardingMemories = await client.add(
  [
    { role: "user", content: "I'm a software developer specializing in TypeScript" },
    { role: "user", content: "I prefer dark mode in all applications" },
    { role: "user", content: "I'm interested in AI and machine learning" },
  ],
  {
    user_id: userId,
    metadata: { phase: "onboarding", timestamp: Date.now() },
  },
);
console.log(`✅ Stored ${onboardingMemories.length} onboarding memories\n`);

// Step 2: Daily interaction - Add new preferences
console.log("💬 Step 2: Daily Interaction");
await client.add(
  [
    { role: "user", content: "I usually code between 9 AM and 5 PM" },
    { role: "user", content: "I take coffee breaks every 2 hours" },
  ],
  {
    user_id: userId,
    metadata: { phase: "daily_use" },
  },
);
console.log(`✅ Added daily interaction memories\n`);

// Step 3: Search for context
console.log("🔍 Step 3: Contextual Search");
const workHabits = await client.search("When does the user work?", {
  user_id: userId,
  limit: 3,
});
console.log(`✅ Found ${workHabits.length} relevant memories:`);
for (const mem of workHabits) {
  const content = mem.data?.memory || mem.memory;
  console.log(`   - ${content} (${(mem.score! * 100).toFixed(0)}% match)`);
}

// Step 4: Update preferences
console.log("\n✏️  Step 4: Update Preferences");
if (onboardingMemories[1]) {
  await client.update(onboardingMemories[1].id, {
    text: "I prefer dark mode and high contrast themes",
    metadata: { updated: true },
  });
  console.log(`✅ Updated theme preference\n`);
}

// Step 5: View history
console.log("📜 Step 5: Audit Trail");
if (onboardingMemories[1]) {
  const history = await client.history(onboardingMemories[1].id);
  console.log(`✅ Memory has ${history.length} history entries:`);
  for (const entry of history) {
    console.log(`   - ${entry.event}: ${entry.old_memory} → ${entry.new_memory}`);
  }
}

// Step 6: Get all memories
console.log("\n📊 Step 6: View All Memories");
const allMemories = await client.getAll({ user_id: userId });
console.log(`✅ Total memories for user: ${allMemories.length}`);

// Step 7: Cleanup
console.log("\n🧹 Step 7: Cleanup");
await client.deleteAll({ user_id: userId });
console.log(`✅ Deleted all memories for ${userId}`);

console.log("\n✨ Complete workflow example finished!");
console.log("\n📋 Workflow Summary:");
console.log("   1. Onboarding → Store initial preferences");
console.log("   2. Daily Use → Add new memories");
console.log("   3. Search → Find relevant context");
console.log("   4. Update → Modify preferences");
console.log("   5. History → Track changes");
console.log("   6. List → View all memories");
console.log("   7. Cleanup → Remove data");
