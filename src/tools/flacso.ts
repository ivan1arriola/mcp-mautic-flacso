import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { ToolDefinition, ToolHandler } from '../types/index.js';

const ranges = ['1h', '6h', '24h', 'today', '3d', '7d', '30d', '90d'];
export const toolDefinitions: ToolDefinition[] = [
  { name: 'flacso_list_offers', description: 'List mapped academic offers, campaign publication, contact counts, successful sends and follow-up days.', inputSchema: { type: 'object', properties: {} } },
  { name: 'flacso_get_email_summary', description: 'Aggregate email states for academic campaigns. Monthly totals cover all offers; results may be truncated by upstream limits.', inputSchema: { type: 'object', properties: { range: { type: 'string', enum: ranges }, offer: { type: 'integer', minimum: 1 } } } },
];

export const toolHandlers: Record<string, ToolHandler> = {
  async flacso_list_offers(client) {
    const response = await client.v1.get('/flacso/reporting/offers');
    return { content: [{ type: 'text', text: JSON.stringify(response.data) }] };
  },
  async flacso_get_email_summary(client, args) {
    const range = args?.range ?? '30d';
    const offer = args?.offer;
    if (!ranges.includes(range) || (offer !== undefined && (!Number.isSafeInteger(offer) || offer < 1))) {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid range or offer ID');
    }
    const response = await client.v1.get('/flacso/reporting/emails', { params: { range, offer } });
    return { content: [{ type: 'text', text: JSON.stringify(response.data) }] };
  },
};
