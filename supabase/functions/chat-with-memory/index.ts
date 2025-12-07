/**
 * Chat with Memory - Supabase Edge Function
 *
 * A practical AI chatbot that remembers user context using Mem0.
 * Demonstrates: add(), search() methods in production
 *
 * Deploy: supabase functions deploy chat-with-memory
 * Test: curl -X POST https://your-project.supabase.co/functions/v1/chat-with-memory \
 *       -H "Content-Type: application/json" \
 *       -d '{"userId":"alice","message":"I love hiking"}'
 */

import { MemoryClient } from "../../../mod.ts";

// Initialize Mem0 client (reused across requests)
const mem0 = new MemoryClient({
  apiKey: Deno.env.get("MEM0_API_KEY")!,
});

interface ChatRequest {
  userId: string;
  message: string;
  includeContext?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    // Parse request
    const body: ChatRequest = await req.json();
    const { userId, message, includeContext = true } = body;

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: "userId and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // 1. Search for relevant memories
    let context = "";
    let relevantMemories: Array<any> = [];
    
    if (includeContext) {
      relevantMemories = await mem0.search(message, {
        user_id: userId,
        limit: 3,
        threshold: 0.6,
      });

      if (relevantMemories.length > 0) {
        context = "\n\nRelevant context from memory:\n" +
          relevantMemories
            .map((m, i) => `${i + 1}. ${m.data?.memory || m.memory}`)
            .join("\n");
      }
    }

    // 2. Generate AI response (simplified - in production, use AI SDK)
    const aiResponse = `I understand: "${message}"${context}\n\nHow can I help you further?`;

    // 3. Store the conversation as memories
    await mem0.add(
      [
        { role: "user", content: message },
        { role: "assistant", content: aiResponse },
      ],
      {
        user_id: userId,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "chat-function",
        },
      },
    );

    // 4. Return response
    return new Response(
      JSON.stringify({
        response: aiResponse,
        memoriesFound: relevantMemories.length,
        userId,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error in chat-with-memory:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
