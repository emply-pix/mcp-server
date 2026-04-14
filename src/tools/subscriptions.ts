import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { EmplyClient } from "../emply-client.js";

export function registerSubscriptionTools(
  server: McpServer,
  client: EmplyClient,
) {
  // ── emply_create_subscription ──────────────────────────────────

  server.tool(
    "emply_create_subscription",
    "Create a recurring PIX subscription. The system automatically generates charges on schedule. Amount is in cents.",
    {
      name: z.string().min(1).describe("Name/label for the subscription"),
      client_id: z
        .string()
        .uuid()
        .describe("UUID of the client to bill"),
      amount_cents: z
        .number()
        .int()
        .positive()
        .describe("Recurring amount in cents (e.g. 9900 = R$ 99.00)"),
      interval: z
        .enum([
          "WEEKLY",
          "BIWEEKLY",
          "MONTHLY",
          "BIMONTHLY",
          "QUARTERLY",
          "SEMIANNUAL",
          "ANNUAL",
        ])
        .describe("Billing interval"),
      description: z
        .string()
        .optional()
        .describe("Optional description for generated charges"),
      start_date: z
        .string()
        .optional()
        .describe("Start date in YYYY-MM-DD format (defaults to today)"),
    },
    async (params) => {
      const res = await client.post("/subscriptions/", params);
      if (!res.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error ${res.status}: ${JSON.stringify(res.data)}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(res.data, null, 2) },
        ],
      };
    },
  );

  // ── emply_list_subscriptions ───────────────────────────────────

  server.tool(
    "emply_list_subscriptions",
    "List subscriptions with pagination. Returns active, paused, and cancelled subscriptions.",
    {
      page: z
        .number()
        .int()
        .min(0)
        .default(0)
        .describe("Page number (0-based)"),
      size: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .describe("Items per page (max 100)"),
    },
    async (params) => {
      const res = await client.get("/subscriptions/", params as Record<string, string | number | undefined>);
      if (!res.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error ${res.status}: ${JSON.stringify(res.data)}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(res.data, null, 2) },
        ],
      };
    },
  );
}
