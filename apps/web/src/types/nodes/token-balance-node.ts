import type { Node } from '@xyflow/react'
import type { NodeTypeEnum } from '@/types/node'
import type { Network } from '../network'

export type TokenBalanceNodeData = {
  pubkey: string
  network: Network
  mint: string
  balance: string
  balanceRaw: string
}

export type TokenBalanceNodeType = Node<TokenBalanceNodeData, NodeTypeEnum.TOKEN_BALANCE>
