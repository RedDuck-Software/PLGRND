import { NodeTypeEnum } from '@/types/node'

export type ToolDef = {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export type RawToolCall = {
  name: string
  input: Record<string, unknown>
}

export type FlowResponse = {
  description: string
  nodes: { id: string; type: string; data?: Record<string, unknown> }[]
  edges: { from: string; fromHandle: string; to: string; toHandle: string }[]
  unknownTypes?: string[]
}

export const CANVAS_TOOLS: ToolDef[] = [
  {
    name: 'add_node',
    description: 'Add a node to the Solana playground canvas.',
    parameters: {
      type: 'object',
      required: ['id', 'type'],
      properties: {
        id: { type: 'string', description: 'Unique node identifier (n1, n2, n3 ...)' },
        type: {
          type: 'string',
          enum: Object.values(NodeTypeEnum),
          description: 'Node type — must be one of the listed values exactly.',
        },
        data: {
          type: 'object',
          description: 'Optional initial data for input nodes. TEXT to { text: "value" }, NUMBER to { number: 42 }, NETWORK to { network: "DEVNET" | "MAINNET" }, PRIVATE_KEY to { privateKey: "..." }.',
        },
      },
    },
  },
  {
    name: 'connect_nodes',
    description: 'Connect an output handle of one node to an input handle of another node.',
    parameters: {
      type: 'object',
      required: ['from', 'fromHandle', 'to', 'toHandle'],
      properties: {
        from: { type: 'string', description: 'Source node id' },
        fromHandle: { type: 'string', description: 'Output field name on the source node' },
        to: { type: 'string', description: 'Target node id' },
        toHandle: { type: 'string', description: 'Input field name on the target node' },
      },
    },
  },
]

export const rawCallsToFlowResponse = (calls: RawToolCall[], description: string): FlowResponse => {
  const nodes: FlowResponse['nodes'] = []
  const edges: FlowResponse['edges'] = []

  for (const call of calls) {
    if (call.name === 'add_node') {
      nodes.push({
        id: call.input.id as string,
        type: call.input.type as string,
        data: call.input.data as Record<string, unknown> | undefined,
      })
    } else if (call.name === 'connect_nodes') {
      edges.push(call.input as FlowResponse['edges'][number])
    }
  }

  return { description, nodes, edges }
}
