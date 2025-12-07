/**
 * Error Handling Example
 *
 * Demonstrates: APIError handling, validation errors
 *
 * Run: deno run --allow-net --allow-env examples/08_error_handling.ts
 */

import { MemoryClient, APIError } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({ apiKey });

console.log("⚠️  Mem0 Deno SDK - Error Handling Example\n");

// 1. Handle API errors
console.log("1️⃣  Testing APIError handling...");
try {
  await client.get("non-existent-memory-id-12345");
} catch (error) {
  if (error instanceof APIError) {
    console.log(`✅ Caught APIError:`);
    console.log(`   Status: ${error.status}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Name: ${error.name}`);
  }
}

// 2. Handle validation errors
console.log("\n2️⃣  Testing validation error...");
try {
  await client.update("some-id", {});
} catch (error) {
  if (error instanceof Error) {
    console.log(`✅ Caught validation error:`);
    console.log(`   ${error.message}`);
  }
}

// 3. Handle network timeouts
console.log("\n3️⃣  SDK has built-in 60s timeout protection");
console.log("   Long requests will throw timeout error");

// 4. Handle missing required fields
console.log("\n4️⃣  Testing missing project ID...");
try {
  const clientWithoutProject = new MemoryClient({ apiKey });
  await clientWithoutProject.getProject({ fields: ["custom_instructions"] });
} catch (error) {
  if (error instanceof Error) {
    console.log(`✅ Caught configuration error:`);
    console.log(`   ${error.message}`);
  }
}

// 5. Best practices
console.log("\n5️⃣  Error handling best practices:");
console.log("   ✓ Always wrap SDK calls in try-catch");
console.log("   ✓ Check for APIError to get HTTP status");
console.log("   ✓ Log errors for debugging");
console.log("   ✓ Return user-friendly messages");

console.log("\n✨ Error handling example complete!");
