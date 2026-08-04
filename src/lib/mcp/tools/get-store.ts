import { defineTool } from "@lovable.dev/mcp-js";

import { currentStore, errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_store",
  title: "Get store",
  description:
    "Get the signed-in shopkeeper's store: name, public slug, WhatsApp, description and business hours.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const store = await currentStore(supabase);
    if (!store) return errorResult("No store found for this account yet.");
    return {
      content: [{ type: "text" as const, text: JSON.stringify(store) }],
      structuredContent: { store },
    };
  },
});
