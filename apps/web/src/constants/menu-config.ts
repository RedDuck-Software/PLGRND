import { NodeTypeEnum, type NodeType } from '@/types/node'

export type MenuCategory = {
  id: string
  label: string
  color: string
  nodes: NodeType[]
}

export const menuConfig: MenuCategory[] = [
  {
    id: 'input',
    label: 'Input',
    color: '#531d2b',
    nodes: [NodeTypeEnum.DISPLAY, NodeTypeEnum.TEXT, NodeTypeEnum.NUMBER],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    color: '#2a5f2b',
    nodes: [NodeTypeEnum.TRANSACTION_BUILDER, NodeTypeEnum.TRANSACTION, NodeTypeEnum.TRANSACTION_VIEW],
  },
  {
    id: 'network',
    label: 'Network',
    color: '#75511e',
    nodes: [NodeTypeEnum.NETWORK, NodeTypeEnum.BALANCE, NodeTypeEnum.TOKEN_BALANCE],
  },
  {
    id: 'programs',
    label: 'Programs',
    color: '#5a1d5f',
    nodes: [NodeTypeEnum.IDL, NodeTypeEnum.PROGRAM_INSTRUCTIONS, NodeTypeEnum.INSTRUCTIONS, NodeTypeEnum.PDA],
  },
  {
    id: 'crypto',
    label: 'Crypto',
    color: '#265c75',
    nodes: [
      NodeTypeEnum.HASH,
      NodeTypeEnum.SIGN,
      NodeTypeEnum.VERIFY_SIGNATURE,
      NodeTypeEnum.KEYPAIR,
      NodeTypeEnum.PRIVATE_KEY,
      NodeTypeEnum.BASE58,
      NodeTypeEnum.BASE64,
    ],
  },
]
