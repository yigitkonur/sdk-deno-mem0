/**
 * Feedback Example
 *
 * Demonstrates: feedback() method for memory quality assessment
 *
 * Run: deno run --allow-net --allow-env examples/09_feedback.ts
 */

import { MemoryClient, Feedback } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });
const userId = `feedback_demo_${Date.now()}`;

console.log("⭐ Mem0 Deno SDK - Feedback Example\n");

// 1. Create a memory
console.log("1️⃣  Creating memory...");
const [memory] = await client.add(
  [{ role: "user", content: "I prefer morning coffee over tea" }],
  { user_id: userId },
);

console.log(`✅ Created memory: ${memory!.id}`);

const memoryId = memory!.id;

// 2. Submit positive feedback
console.log("\n2️⃣  Submitting positive feedback...");
await client.feedback({
  memory_id: memoryId,
  feedback: Feedback.POSITIVE,
  feedback_reason: "Accurately captured my preference",
});

console.log(`✅ Positive feedback submitted`);

// 3. Update memory and submit negative feedback
console.log("\n3️⃣  Testing negative feedback...");
const [updated] = await client.add(
  [{ role: "user", content: "Actually, I don't like coffee" }],
  { user_id: userId },
);

await client.feedback({
  memory_id: updated!.id,
  feedback: Feedback.NEGATIVE,
  feedback_reason: "Contradicts previous statement",
});

console.log(`✅ Negative feedback submitted`);

// 4. Feedback types available
console.log("\n4️⃣  Available feedback types:");
console.log(`   - Feedback.POSITIVE: Memory was helpful`);
console.log(`   - Feedback.NEGATIVE: Memory was not helpful`);
console.log(`   - Feedback.VERY_NEGATIVE: Memory was harmful/incorrect`);

// Clean up
await client.deleteAll({ user_id: userId });

console.log("\n✨ Feedback example complete!");
console.log("💡 Use feedback to improve memory quality over time");
