import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { EmplyClient } from "../emply-client.js";

export function registerBalanceTools(server: McpServer, client: EmplyClient) {
  // ── emply_get_balance ──────────────────────────────────────────

  server.tool(
    "emply_get_balance",
    "Get the current account balance. Returns available and pending amounts in cents.",
    {},
    async () => {
      const res = await client.get("/statements/balance");
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

  // ── emply_get_statement ────────────────────────────────────────

  server.tool(
    "emply_get_statement",
    "Get account statement (transaction history). Use start_date and end_date to filter by period.",
    {
      start_date: z
        .string()
        .optional()
        .describe("Start date in YYYY-MM-DD format"),
      end_date: z
        .string()
        .optional()
        .describe("End date in YYYY-MM-DD format"),
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
      const res = await client.get("/statements/", params as Record<string, string | number | undefined>);
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
