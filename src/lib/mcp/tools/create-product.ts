import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { currentStore, errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_product",
  title: "Create product",
  description: "Add a product to the signed-in shopkeeper's catalog.",
  inputSchema: {
    name: z.string().describe("Product name."),
    price: z.number().describe("Current selling price."),
    description: z.string().optional().describe("Short product description."),
    old_price: z.number().optional().describe("Previous price, shown struck through."),
    unit: z.string().optional().describe("Unit such as UN, KG, L, CX (default UN)."),
    is_active: z.boolean().optional().describe("Whether the product shows on the storefront (default true)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const name = input.name.trim();
    if (!name) return errorResult("Product name is required.");

    const supabase = supabaseForUser(ctx);
    const store = await currentStore(supabase);
    if (!store) return errorResult("No store found for this account yet.");

    const { data, error } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        name,
        price: input.price,
        description: input.description ?? "",
        old_price: input.old_price ?? null,
        unit: input.unit ?? "UN",
        is_active: input.is_active ?? true,
      })
      .select("id, name, price, old_price, unit, is_active")
      .single();
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
      structuredContent: { product: data },
    };
  },
});
