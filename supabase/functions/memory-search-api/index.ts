/**
 * Memory Search API - Supabase Edge Function
 *
 * RESTful API for searching user memories.
 * Demonstrates: search(), getAll() methods
 *
 * Deploy: supabase functions deploy memory-search-api
 */

import { APIError, MemoryClient } from "../../../mod.ts";

const mem0 = new MemoryClient({
  apiKey: Deno.env.get("MEM0_API_KEY")!,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "userId query parameter is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    // GET: List all memories
    if (req.method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

      const response = await mem0.getAll({
        user_id: userId,
        page,
        page_size: pageSize,
      });

      // Handle both array and paginated response
      const memories = Array.isArray(response) ? response : response.results || [];

      return new Response(
        JSON.stringify({
          memories: memories.map((m: any) => ({
            id: m.id,
            content: m.data?.memory || m.memory,
            created_at: m.created_at,
            categories: m.categories,
          })),
          page,
          pageSize,
          total: memories.length,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // POST: Search memories
    if (req.method === "POST") {
      const { query, limit = 5, threshold = 0.7 } = await req.json();

      if (!query) {
        return new Response(
          JSON.stringify({ error: "query is required in request body" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const results = await mem0.search(query, {
        user_id: userId,
        limit,
        threshold,
      });

      return new Response(
        JSON.stringify({
          query,
          results: results.map((m) => ({
            id: m.id,
            content: m.data?.memory || m.memory,
            score: m.score,
            categories: m.categories,
          })),
          count: results.length,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in memory-search-api:", error);

    const status = error instanceof APIError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({ error: message }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
