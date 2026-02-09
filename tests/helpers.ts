import { vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type ToolHandler = (params: Record<string, unknown>) => Promise<{
  content: { type: string; text: string }[];
  isError?: boolean;
}>;

type ResourceHandler = (uri: URL) => Promise<{
  contents: { uri: string; mimeType: string; text: string }[];
}>;

/**
 * Creates a mock McpServer that captures registered tool and resource handlers.
 */
export function createMockServer() {
  const tools = new Map<string, ToolHandler>();
  const resources = new Map<string, ResourceHandler>();

  const server = {
    tool: vi.fn(
      (
        name: string,
        _descriptionOrSchema: unknown,
        _schemaOrHandler: unknown,
        handler?: ToolHandler,
      ) => {
        // server.tool(name, description, schema, handler) — 4-arg form
        if (typeof handler === "function") {
          tools.set(name, handler);
        }
        // server.tool(name, schema, handler) — 3-arg form
        else if (typeof _schemaOrHandler === "function") {
          tools.set(name, _schemaOrHandler as ToolHandler);
        }
      },
    ),
    resource: vi.fn(
      (
        _name: string,
        _uri: string,
        _opts: unknown,
        handler: ResourceHandler,
      ) => {
        resources.set(_uri, handler);
      },
    ),
  } as unknown as McpServer;

  return {
    server,
    getToolHandler(name: string): ToolHandler {
      const handler = tools.get(name);
      if (!handler) throw new Error(`Tool "${name}" not registered`);
      return handler;
    },
    getResourceHandler(uri: string): ResourceHandler {
      const handler = resources.get(uri);
      if (!handler) throw new Error(`Resource "${uri}" not registered`);
      return handler;
    },
  };
}
