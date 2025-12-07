/**
 * Webhooks Example
 *
 * Demonstrates: getWebhooks(), createWebhook(), updateWebhook(), deleteWebhook()
 *
 * Run: deno run --allow-net --allow-env examples/06_webhooks.ts
 */

import { MemoryClient } from "../mod.ts";

const apiKey = Deno.env.get("MEM0_API_KEY");
if (!apiKey) {
  console.error("❌ MEM0_API_KEY required");
  Deno.exit(1);
}

const client = new MemoryClient({
  apiKey,
  organizationId: Deno.env.get("MEM0_ORG_ID"),
  projectId: Deno.env.get("MEM0_PROJECT_ID"),
});

console.log("🪝 Mem0 Deno SDK - Webhooks Example\n");
console.log("⚠️  Note: Requires organizationId and projectId to be set\n");

try {
  // 1. List existing webhooks
  console.log("1️⃣  Listing existing webhooks...");
  const webhooks = await client.getWebhooks();
  console.log(`✅ Found ${webhooks.length} webhooks`);
  for (const webhook of webhooks) {
    console.log(`   - ${webhook.name}: ${webhook.url}`);
    console.log(`     Events: ${webhook.event_types?.join(", ")}`);
    console.log(`     Active: ${webhook.is_active}`);
  }

  // 2. Create a new webhook
  console.log("\n2️⃣  Creating new webhook...");
  const newWebhook = await client.createWebhook({
    name: "Demo Webhook",
    url: "https://example.com/webhooks/mem0",
    eventTypes: ["memory_add", "memory_update"],
    projectId: Deno.env.get("MEM0_PROJECT_ID") || "",
    webhookId: "", // Empty for new webhook
  });

  console.log(`✅ Created webhook: ${newWebhook.webhook_id}`);
  console.log(`   Name: ${newWebhook.name}`);
  console.log(`   URL: ${newWebhook.url}`);

  const webhookId = newWebhook.webhook_id!;

  // 3. Update the webhook
  console.log("\n3️⃣  Updating webhook...");
  await client.updateWebhook({
    webhookId,
    name: "Updated Demo Webhook",
    url: "https://example.com/webhooks/mem0-v2",
    eventTypes: ["memory_add", "memory_update", "memory_delete"],
    projectId: Deno.env.get("MEM0_PROJECT_ID") || "",
  });

  console.log(`✅ Webhook updated`);

  // 4. Verify update
  console.log("\n4️⃣  Verifying update...");
  const updatedWebhooks = await client.getWebhooks();
  const updated = updatedWebhooks.find((w) => w.webhook_id === webhookId);
  if (updated) {
    console.log(`✅ Verified: ${updated.name}`);
    console.log(`   Events: ${updated.event_types?.join(", ")}`);
  }

  // 5. Delete the webhook
  console.log("\n5️⃣  Deleting webhook...");
  await client.deleteWebhook({ webhookId });
  console.log(`✅ Webhook deleted`);

  console.log("\n✨ Webhooks example complete!");
} catch (error) {
  if (error instanceof Error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.message.includes("organizationId")) {
      console.log("\n💡 Set environment variables:");
      console.log("   export MEM0_ORG_ID=your-org-id");
      console.log("   export MEM0_PROJECT_ID=your-project-id");
    }
  }
}
