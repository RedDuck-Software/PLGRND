import type { Node } from '@xyflow/react'
import type { NodeTypeEnum } from '../../node'

export type CommentNodeData = {
  text?: string
}

export type CommentNodeType = Node<CommentNodeData, NodeTypeEnum.COMMENT>
