import { Position } from '@xyflow/react'
import type { NodeConfig } from '@/types/node-config'

export const base58NodeConfig = {
  label: 'BASE58',
  handles: [
    { position: Position.Left, type: 'target', dataField: 'input', label: '' },
    { position: Position.Right, type: 'source', dataField: 'output', label: '' },
  ],
  actions: [],
} as const satisfies NodeConfig
