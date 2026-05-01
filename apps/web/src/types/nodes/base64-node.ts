import type { Node } from '@xyflow/react'
import type { NodeTypeEnum } from '@/types/node'

export type Base64Mode = 'encode' | 'decode'

export type Base64NodeData = {
  input: string
  mode: Base64Mode
  output: string
}

export type Base64NodeType = Node<Base64NodeData, NodeTypeEnum.BASE64>
