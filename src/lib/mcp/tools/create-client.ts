import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { currentStore, errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_client",
  title: "Create customer",
  description: "Save a new customer in the signed-in shopkeeper's account.",
  inputSchema: {
    name: z.string().describe("Customer name."),
    phone: z.string().optional().describe("WhatsApp/phone number."),
    address: z.string().optional().describe("Delivery address."),
    birth_date: z.string().optional().describe("Birth date as YYYY-MM-DD."),
    notes: z.string().optional().describe("Free-form notes about the customer."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const name = input.name.trim();
    if (!name) return errorResult("Customer name is required.");

    const supabase = supabaseForUser(ctx);
    const store = await currentStore(supabase);
    if (!store) return errorResult("No store found for this account yet.");

    const { data, error } = await supabase
      .from("clients")
      .insert({
        store_id: store.id,
        name,
        phone: input.phone ?? "",
        address: input.address ?? "",
        birth_date: input.birth_date ?? null,
        notes: input.notes ?? "",
      })
      .select("id, name, phone, address, birth_date, notes")
      .single();
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
      structuredContent: { client: data },
    };
  },
});
