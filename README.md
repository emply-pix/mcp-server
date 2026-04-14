# @emply/mcp-server

MCP (Model Context Protocol) server that exposes the Emply PIX payment API as tools for AI agents.

## Installation

```bash
cd sdks/mcp
npm install
npm run build
```

## Configuration

The server requires one environment variable and accepts one optional override:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMPLY_API_KEY` | Yes | -- | Your API key (`sk_sandbox_...` or `sk_live_...`) |
| `EMPLY_BASE_URL` | No | `https://api.emply.com.br/api/v1` | API base URL |

The environment (sandbox vs. production) is auto-detected from the API key prefix.

## Usage with Claude Code

Add the following to your project's `.mcp.json` (or `~/.claude/mcp.json` for global):

```json
{
  "mcpServers": {
    "emply": {
      "command": "node",
      "args": ["/absolute/path/to/sdks/mcp/dist/index.js"],
      "env": {
        "EMPLY_API_KEY": "sk_sandbox_your_key_here"
      }
    }
  }
}
```

Or if installed globally via `npm install -g`:

```json
{
  "mcpServers": {
    "emply": {
      "command": "emply-mcp",
      "env": {
        "EMPLY_API_KEY": "sk_sandbox_your_key_here"
      }
    }
  }
}
```

## Usage with other AI tools

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "emply": {
      "command": "node",
      "args": ["/absolute/path/to/sdks/mcp/dist/index.js"],
      "env": {
        "EMPLY_API_KEY": "sk_sandbox_your_key_here"
      }
    }
  }
}
```

### Generic MCP client

The server uses **stdio transport** (stdin/stdout). Any MCP-compatible client can launch it as a subprocess:

```bash
EMPLY_API_KEY=sk_sandbox_xxx node /path/to/sdks/mcp/dist/index.js
```

## Available tools

### Charges

| Tool | Description |
|------|-------------|
| `emply_create_charge` | Create a PIX charge (INSTANT, COBV, BOLEPIX, or CARNEPIX). Amount in cents. |
| `emply_list_charges` | List charges with optional status/type filters and pagination. |
| `emply_get_charge` | Get a single charge by UUID with full details (QR code, status, etc.). |
| `emply_cancel_charge` | Cancel a pending charge. |

### Clients

| Tool | Description |
|------|-------------|
| `emply_create_client` | Create a customer (name, email, CPF/CNPJ, phone). |
| `emply_list_clients` | List/search customers with pagination. |

### Subscriptions

| Tool | Description |
|------|-------------|
| `emply_create_subscription` | Create a recurring PIX subscription for a client. |
| `emply_list_subscriptions` | List subscriptions with pagination. |

### Balance & Statements

| Tool | Description |
|------|-------------|
| `emply_get_balance` | Get current account balance (available and pending). |
| `emply_get_statement` | Get account statement with optional date range filter. |

### Webhooks

| Tool | Description |
|------|-------------|
| `emply_configure_webhook` | Create or update a webhook endpoint for event notifications. |

## Examples

Once configured, an AI agent can use these tools naturally:

- "Create a R$ 50.00 PIX charge for subscription payment" -- calls `emply_create_charge` with `amount_cents: 5000`
- "Show me all pending charges" -- calls `emply_list_charges` with `status: "PENDING"`
- "What's our current balance?" -- calls `emply_get_balance`
- "Create a monthly subscription of R$ 99.00 for client X" -- calls `emply_create_subscription`

## Development

```bash
npm install
npm run dev          # watch mode (recompiles on change)
npm run build        # production build
npm run lint         # type-check without emitting
```
