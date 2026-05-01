import type { Node } from '@xyflow/react'
import type { NodeTypeEnum } from '@/types/node'

export type Base58Mode = 'encode' | 'decode'

export type Base58NodeData = {
  input: string
  mode: Base58Mode
  output: string
}

export type Base58NodeType = Node<Base58NodeData, NodeTypeEnum.BASE58>
