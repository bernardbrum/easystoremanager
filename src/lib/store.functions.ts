import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Returns the PIX key for a single store (never exposed in bulk to the Data API). */
export const getStorePix = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("pix_key")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    return { pixKey: store?.pix_key ?? "" };
  });
