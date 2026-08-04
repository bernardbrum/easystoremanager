import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { currentStore, errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_reviews",
  title: "List reviews",
  description:
    "List the reviews customers left for the signed-in shopkeeper's store, newest first, with the average rating.",
  inputSchema: {
    max_rating: z
      .number()
      .int()
      .optional()
      .describe("Return only reviews at or below this rating, e.g. 4 for private feedback."),
    limit: z.number().int().optional().describe("Maximum number of reviews to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ max_rating, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const store = await currentStore(supabase);
    if (!store) return errorResult("No store found for this account yet.");

    const max = Math.min(Math.max(limit ?? 50, 1), 200);
    let query = supabase
      .from("reviews")
      .select("id, rating, feedback, created_at")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(max);
    if (typeof max_rating === "number") query = query.lte("rating", max_rating);

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    const reviews = data ?? [];
    const average = reviews.length
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null;
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ average, reviews }) }],
      structuredContent: { average, reviews },
    };
  },
});
