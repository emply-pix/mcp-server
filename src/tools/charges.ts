import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { EmplyClient } from "../emply-client.js";

export function registerChargeTools(server: McpServer, client: EmplyClient) {
  // ── emply_create_charge ────────────────────────────────────────

  server.tool(
    "emply_create_charge",
    "Create a PIX charge. Types: INSTANT (immediate PIX), COBV (PIX with due date), BOLEPIX (boleto + QR code), CARNEPIX (installment PIX). Amount is in cents (e.g. 5000 = R$ 50,00).",
    {
      amount_cents: z
        .number()
        .int()
        .positive()
        .describe("Amount in cents (e.g. 5000 = R$ 50.00)"),
      description: z
        .string()
        .min(1)
        .describe("Charge description shown to the payer"),
      type: z
        .enum(["INSTANT", "COBV", "BOLEPIX", "CARNEPIX"])
        .default("INSTANT")
        .describe("Charge type: INSTANT, COBV, BOLEPIX, or CARNEPIX"),
      client_id: z
        .string()
        .uuid()
        .optional()
        .describe("UUID of an existing client to attach to this charge"),
      due_date: z
        .string()
        .optional()
        .describe(
          "Due date in ISO 8601 format (required for COBV, optional for others)",
        ),
      installments: z
        .number()
        .int()
        .min(2)
        .optional()
        .describe("Number of installments (CARNEPIX only, minimum 2)"),
      installment_interval: z
        .number()
        .int()
        .positive()
        .optional()
        .describe(
          "Days between installments (CARNEPIX only, default 30)",
        ),
    },
    async (params) => {
      const res = await client.post("/charges/", params);
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

  // ── emply_list_charges ─────────────────────────────────────────

  server.tool(
    "emply_list_charges",
    "List charges with optional filters. Returns paginated results with items array and total count.",
    {
      status: z
        .enum(["PENDING", "PAID", "CANCELLED", "REFUNDED", "FAILED", "EXPIRED"])
        .optional()
        .describe("Filter by charge status"),
      type: z
        .enum(["INSTANT", "COBV", "BOLEPIX", "CARNEPIX"])
        .optional()
        .describe("Filter by charge type"),
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
      const res = await client.get("/charges/", params as Record<string, string | number | undefined>);
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

  // ── emply_get_charge ───────────────────────────────────────────

  server.tool(
    "emply_get_charge",
    "Get a single charge by its UUID. Returns full charge details including QR code, status, and payment info.",
    {
      charge_id: z.string().uuid().describe("UUID of the charge"),
    },
    async ({ charge_id }) => {
      const res = await client.get(`/charges/${charge_id}`);
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

  // ── emply_cancel_charge ────────────────────────────────────────

  server.tool(
    "emply_cancel_charge",
    "Cancel a pending charge. Only charges with status PENDING can be cancelled.",
    {
      charge_id: z.string().uuid().describe("UUID of the charge to cancel"),
    },
    async ({ charge_id }) => {
      const res = await client.post(`/charges/${charge_id}/cancel`);
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
