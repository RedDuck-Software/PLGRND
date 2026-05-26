import { Position } from '@xyflow/react'
import type { NodeConfig } from '@/types/node-config'

export const mnemonicNodeConfig = {
  label: 'MNEMONIC',
  handles: [
    {
      position: Position.Left,
      type: 'target',
      dataField: 'mnemonic',
      label: 'Mnemonic',
      dataType: 'text',
      maxConnections: 1,
    },
    {
      position: Position.Right,
      type: 'source',
      dataField: 'privateKey',
      label: 'Private Key',
      dataType: 'privateKey',
    },
    {
      position: Position.Right,
      type: 'source',
      dataField: 'mnemonic',
      label: 'Mnemonic',
      dataType: 'text',
    },
  ],
  actions: [{ position: Position.Left, label: 'Generate' }],
} as const satisfies NodeConfig
