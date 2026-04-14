import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { EmplyClient } from "../emply-client.js";

export function registerClientTools(server: McpServer, client: EmplyClient) {
  // ── emply_create_client ────────────────────────────────────────

  server.tool(
    "emply_create_client",
    "Create a new client (customer) that can be referenced when creating charges or subscriptions. CPF/CNPJ is the Brazilian tax ID.",
    {
      name: z.string().min(1).describe("Full name of the client"),
      email: z
        .string()
        .email()
        .optional()
        .describe("Email address of the client"),
      cpf_cnpj: z
        .string()
        .optional()
        .describe(
          "Brazilian CPF (11 digits) or CNPJ (14 digits), numbers only",
        ),
      phone: z
        .string()
        .optional()
        .describe("Phone number, numbers only (e.g. 11999999999)"),
    },
    async (params) => {
      const res = await client.post("/clients/", params);
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

  // ── emply_list_clients ─────────────────────────────────────────

  server.tool(
    "emply_list_clients",
    "List clients (customers) with optional search and pagination. Search matches name, email, or CPF/CNPJ.",
    {
      search: z
        .string()
        .optional()
        .describe("Search term to filter by name, email, or CPF/CNPJ"),
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
      const res = await client.get("/clients/", params as Record<string, string | number | undefined>);
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
