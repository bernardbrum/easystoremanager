import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { currentStore, errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_clients",
  title: "List customers",
  description: "List the customers saved in the signed-in shopkeeper's account.",
  inputSchema: {
    search: z.string().optional().describe("Filter customers whose name contains this text."),
    limit: z.number().int().optional().describe("Maximum number of customers to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const store = await currentStore(supabase);
    if (!store) return errorResult("No store found for this account yet.");

    const max = Math.min(Math.max(limit ?? 50, 1), 200);
    let query = supabase
      .from("clients")
      .select("id, name, phone, address, birth_date, notes")
      .eq("store_id", store.id)
      .order("name")
      .limit(max);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
      structuredContent: { clients: data ?? [] },
    };
  },
});
