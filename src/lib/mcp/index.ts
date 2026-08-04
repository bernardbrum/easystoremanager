import { auth, defineMcp } from "@lovable.dev/mcp-js";

import createClientTool from "./tools/create-client";
import createProductTool from "./tools/create-product";
import getStoreTool from "./tools/get-store";
import listClientsTool from "./tools/list-clients";
import listProductsTool from "./tools/list-products";
import listReviewsTool from "./tools/list-reviews";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "easystore-manager",
  title: "EasyStore Manager",
  version: "0.1.0",
  instructions:
    "Tools for EasyStore Manager, a storefront manager for local shops. Use get_store for the signed-in shopkeeper's store details, list_products/create_product for the catalog, list_clients/create_client for customers, and list_reviews for customer ratings and private feedback.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  // exactOptionalPropertyTypes rejects the implicit `outputSchema: undefined`
  // on tools that declare no output schema; the runtime shape is correct.
  tools: [
    getStoreTool,
    listProductsTool,
    createProductTool,
    listClientsTool,
    createClientTool,
    listReviewsTool,
  ] as unknown as Parameters<typeof defineMcp>[0]["tools"],
});
