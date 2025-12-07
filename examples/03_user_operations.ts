/**
 * User Operations Example
 *
 * Demonstrates: users(), deleteUsers() methods
 *
 * Run: deno run --allow-net --allow-env examples/03_user_operations.ts
 */

import { MemoryClient } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });

console.log("👥 Mem0 Deno SDK - User Operations Example\n");

// 1. Create memories for multiple users
console.log("1️⃣  Creating memories for multiple users...");

const users = ["alice", "bob", "charlie"];
for (const user of users) {
  await client.add(
    [
      {
        role: "user",
        content: `Hello, I'm ${user}!`,
      },
    ],
    { user_id: `demo_${user}` },
  );
  console.log(`   ✓ Created memory for ${user}`);
}

// 2. List all users
console.log("\n2️⃣  Listing all users/entities...");
const allUsers = await client.users();

console.log(`✅ Found ${allUsers.count} total entities`);
console.log(`   Showing ${allUsers.results.length} results:`);

for (const user of allUsers.results.slice(0, 10)) {
  console.log(`   - ${user.name} (${user.type}): ${user.total_memories} memories`);
}

// 3. Find demo users
console.log("\n3️⃣  Finding demo users...");
const demoUsers = allUsers.results.filter((u) => u.name.startsWith("demo_"));
console.log(`✅ Found ${demoUsers.length} demo users`);

// 4. Delete specific user
if (demoUsers.length > 0) {
  console.log("\n4️⃣  Deleting specific user...");
  const userToDelete = demoUsers[0]!;
  await client.deleteUsers({ user_id: userToDelete.name });
  console.log(`✅ Deleted user: ${userToDelete.name}`);
}

// 5. Clean up remaining demo users
console.log("\n5️⃣  Cleaning up remaining demo users...");
for (const user of demoUsers.slice(1)) {
  await client.deleteUsers({ user_id: user.name });
  console.log(`   ✓ Deleted ${user.name}`);
}

// 6. Verify cleanup
console.log("\n6️⃣  Verifying cleanup...");
const finalUsers = await client.users();
const remainingDemo = finalUsers.results.filter((u) => u.name.startsWith("demo_"));
console.log(`✅ Remaining demo users: ${remainingDemo.length}`);

console.log("\n✨ User operations example complete!");
