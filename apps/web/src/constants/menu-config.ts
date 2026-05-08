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
    color: '#3B82F6',
    nodes: [NodeTypeEnum.DISPLAY, NodeTypeEnum.TEXT, NodeTypeEnum.NUMBER],
  },
  {
    id: 'math',
    label: 'Math',
    color: '#5B9BFF',
    nodes: [
      NodeTypeEnum.ADD,
      NodeTypeEnum.SUBTRACT,
      NodeTypeEnum.MULTIPLY,
      NodeTypeEnum.DIVIDE,
      NodeTypeEnum.MODULO,
      NodeTypeEnum.EXPONENT,
      NodeTypeEnum.ROUND,
      NodeTypeEnum.MIN,
      NodeTypeEnum.MAX,
    ],
  },
  {
    id: 'logic',
    label: 'Control',
    color: '#FFB849',
    nodes: [
      NodeTypeEnum.BOOLEAN,
      NodeTypeEnum.AND,
      NodeTypeEnum.OR,
      NodeTypeEnum.NOT,
      NodeTypeEnum.EQUAL,
      NodeTypeEnum.COMPARE,
      NodeTypeEnum.HAS_VALUE,
      NodeTypeEnum.IF,
    ],
  },
  {
    id: 'utils',
    label: 'Utils',
    color: '#B6B6CC',
    nodes: [
      NodeTypeEnum.SOL_TO_LAMPORTS,
      NodeTypeEnum.LAMPORTS_TO_SOL,
      NodeTypeEnum.VALID_PUBLIC_KEY,
      NodeTypeEnum.ATA,
      NodeTypeEnum.TOKEN_AMOUNT_TO_RAW,
      NodeTypeEnum.RAW_TO_TOKEN_AMOUNT,
      NodeTypeEnum.RENT_EXEMPT,
      NodeTypeEnum.STRING_ENCODE,
      NodeTypeEnum.STRING_DECODE,
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    color: '#9945FF',
    nodes: [NodeTypeEnum.TRANSACTION_BUILDER, NodeTypeEnum.TRANSACTION, NodeTypeEnum.TRANSACTION_VIEW],
  },
  {
    id: 'network',
    label: 'Network',
    color: '#00C2A0',
    nodes: [NodeTypeEnum.NETWORK, NodeTypeEnum.BALANCE],
  },
  {
    id: 'programs',
    label: 'Programs',
    color: '#A78BFA',
    nodes: [
      NodeTypeEnum.IDL,
      NodeTypeEnum.PROGRAM_INSTRUCTIONS,
      NodeTypeEnum.PROGRAM_ACCOUNT,
      NodeTypeEnum.INSTRUCTIONS,
      NodeTypeEnum.PDA,
    ],
  },
  {
    id: 'wallet',
    label: 'Wallet',
    color: '#3DD7E5',
    nodes: [NodeTypeEnum.WALLET],
  },
  {
    id: 'crypto',
    label: 'Crypto',
    color: '#14F195',
    nodes: [
      NodeTypeEnum.HASH,
      NodeTypeEnum.SIGN,
      NodeTypeEnum.VERIFY_SIGNATURE,
      NodeTypeEnum.KEYPAIR,
      NodeTypeEnum.PRIVATE_KEY,
    ],
  },
  {
    id: 'string',
    label: 'String',
    color: '#FF8A4C',
    nodes: [
      NodeTypeEnum.STRING_COMBINE,
      NodeTypeEnum.STRING_LENGTH,
      NodeTypeEnum.STRING_SUBSTRING,
      NodeTypeEnum.STRING_SPLIT,
      NodeTypeEnum.STRING_SEARCH,
      NodeTypeEnum.STRING_REPLACE,
    ],
  },
]
