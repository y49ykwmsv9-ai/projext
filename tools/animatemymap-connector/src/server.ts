import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { importPlan, openStudio, renderVideo } from "./automation.js";

const server = new McpServer({
  name: "worldforge-animatemymap",
  version: "0.1.0"
});

const clip = z.object({
  title: z.string().optional(),
  location: z.string(),
  durationSeconds: z.number().positive().optional(),
  camera: z.enum(["top-down", "bounce", "fly-to", "orbit", "sweep"]).optional(),
  highlightedCountries: z.array(z.string()).optional(),
  highlightedRegions: z.array(z.string()).optional(),
  fill: z.string().optional(),
  border: z.string().optional(),
  borderWidth: z.number().positive().optional(),
  arrows: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional()
  })).optional(),
  labels: z.array(z.object({
    text: z.string(),
    location: z.string()
  })).optional(),
  narration: z.string().optional()
});

const planSchema = z.object({
  title: z.string(),
  aspectRatio: z.enum(["16:9", "9:16"]).optional(),
  fps: z.union([z.literal(30), z.literal(60)]).optional(),
  resolution: z.enum(["720p", "1080p", "4k"]).optional(),
  theme: z.enum(["dark", "light", "satellite", "custom"]).optional(),
  clips: z.array(clip).min(1)
});

server.registerTool("animatemymap_open", {
  description: "Open AnimateMyMap in a persistent browser session. Login is retained between runs.",
  inputSchema: {}
}, async () => {
  const result = await openStudio();
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.registerTool("animatemymap_create_plan", {
  description: "Prepare a complete AnimateMyMap timeline from a structured scene plan.",
  inputSchema: planSchema.shape
}, async (args) => {
  const result = await importPlan(planSchema.parse(args));
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.registerTool("animatemymap_render", {
  description: "Trigger AnimateMyMap's render/export control for the currently loaded timeline.",
  inputSchema: {}
}, async () => {
  const result = await renderVideo();
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.registerTool("animatemymap_health", {
  description: "Check that the connector can launch and reach AnimateMyMap.",
  inputSchema: {}
}, async () => {
  const result = await openStudio();
  return { content: [{ type: "text", text: JSON.stringify({ ok: true, ...result }, null, 2) }] };
});

await server.connect(new StdioServerTransport());
