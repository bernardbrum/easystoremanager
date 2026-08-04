import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { currentStore, errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List the products in the signed-in shopkeeper's catalog, optionally filtered by name and by active state.",
  inputSchema: {
    search: z.string().optional().describe("Filter products whose name contains this text."),
    only_active: z.boolean().optional().describe("When true, return only products on the storefront."),
    limit: z.number().int().optional().describe("Maximum number of products to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, only_active, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const store = await currentStore(supabase);
    if (!store) return errorResult("No store found for this account yet.");

    const max = Math.min(Math.max(limit ?? 50, 1), 200);
    let query = supabase
      .from("products")
      .select("id, name, description, price, old_price, unit, is_active, category_id")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(max);
    if (search) query = query.ilike("name", `%${search}%`);
    if (only_active) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
