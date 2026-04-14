#!/usr/bin/env node

/**
 * @emply/mcp-server
 *
 * MCP (Model Context Protocol) server that exposes the Emply PIX payment API
 * as tools for AI agents. Uses stdio transport.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { EmplyClient } from "./emply-client.js";
import { registerChargeTools } from "./tools/charges.js";
import { registerClientTools } from "./tools/clients.js";
import { registerSubscriptionTools } from "./tools/subscriptions.js";
import { registerBalanceTools } from "./tools/balance.js";
import { registerWebhookTools } from "./tools/webhooks.js";

// ── configuration ────────────────────────────────────────────────

const apiKey = process.env.EMPLY_API_KEY;
if (!apiKey) {
  console.error(
    "EMPLY_API_KEY environment variable is required.\n" +
      "Set it to your sandbox key (sk_sandbox_...) or production key (sk_live_...).",
  );
  process.exit(1);
}

const baseUrl =
  process.env.EMPLY_BASE_URL ?? "https://api.emply.com.br/api/v1";

// ── bootstrap ────────────────────────────────────────────────────

const client = new EmplyClient({ apiKey, baseUrl });

const server = new McpServer({
  name: "emply",
  version: "1.0.0",
});

// Register all tool groups
registerChargeTools(server, client);
registerClientTools(server, client);
registerSubscriptionTools(server, client);
registerBalanceTools(server, client);
registerWebhookTools(server, client);

// ── start ────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error starting MCP server:", err);
  process.exit(1);
});
