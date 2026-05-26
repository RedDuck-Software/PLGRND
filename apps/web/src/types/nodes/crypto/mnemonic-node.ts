import type { Node } from '@xyflow/react'
import type { NodeTypeEnum } from '../../node'

export type MnemonicNodeData = {
  mnemonic: string
  privateKey: string
}

export type MnemonicNodeType = Node<MnemonicNodeData, NodeTypeEnum.MNEMONIC>
