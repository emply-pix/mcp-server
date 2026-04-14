import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { EmplyClient } from "../emply-client.js";

export function registerWebhookTools(server: McpServer, client: EmplyClient) {
  // ── emply_configure_webhook ────────────────────────────────────

  server.tool(
    "emply_configure_webhook",
    "Create or update a webhook endpoint configuration. Events: charge.created, charge.paid, charge.cancelled, charge.refunded, charge.expired, subscription.created, subscription.cancelled, subscription.paused, subscription.resumed, client.created, client.updated. If webhook_id is provided, updates the existing config; otherwise creates a new one.",
    {
      url: z
        .string()
        .url()
        .describe("HTTPS URL that will receive webhook POST requests"),
      events: z
        .array(z.string())
        .min(1)
        .describe(
          "List of event types to subscribe to (e.g. ['charge.paid', 'charge.created'])",
        ),
      secret: z
        .string()
        .optional()
        .describe(
          "HMAC-SHA256 secret for verifying webhook signatures. If omitted, Emply generates one.",
        ),
      webhook_id: z
        .string()
        .uuid()
        .optional()
        .describe(
          "UUID of an existing webhook config to update. Omit to create a new one.",
        ),
    },
    async ({ webhook_id, ...body }) => {
      let res;
      if (webhook_id) {
        res = await client.put(`/webhooks/config/${webhook_id}`, body);
      } else {
        res = await client.post("/webhooks/config", body);
      }
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
