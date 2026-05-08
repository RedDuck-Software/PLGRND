import { NodeTypeEnum, type NodeType } from '@/types/node'

interface NodeStyle {
  color: string
  icon: string
  category: string
  width?: number
  height?: number
}

const INPUT = '#3B82F6'
const MATH = '#5B9BFF'
const CONTROL = '#FFB849'
const UTILS = '#B6B6CC'
const TX = '#9945FF'
const NETWORK = '#00C2A0'
const PROGRAMS = '#A78BFA'
const WALLET = '#3DD7E5'
const CRYPTO = '#14F195'
const STRING = '#FF8A4C'

export const nodeStyles: Record<NodeType, NodeStyle> = {
  [NodeTypeEnum.TEXT]: { color: INPUT, icon: 'type', category: 'input', width: 220 },
  [NodeTypeEnum.DISPLAY]: { color: INPUT, icon: 'eye', category: 'display', width: 220 },
  [NodeTypeEnum.NUMBER]: { color: INPUT, icon: 'hash', category: 'input', width: 140 },
  [NodeTypeEnum.BOOLEAN]: { color: CONTROL, icon: 'toggle-left', category: 'control', width: 160 },

  [NodeTypeEnum.ADD]: { color: MATH, icon: 'plus', category: 'math', width: 192 },
  [NodeTypeEnum.SUBTRACT]: { color: MATH, icon: 'minus', category: 'math', width: 192 },
  [NodeTypeEnum.MULTIPLY]: { color: MATH, icon: 'x', category: 'math', width: 192 },
  [NodeTypeEnum.DIVIDE]: { color: MATH, icon: 'divide', category: 'math', width: 192 },
  [NodeTypeEnum.MODULO]: { color: MATH, icon: 'percent', category: 'math', width: 192 },
  [NodeTypeEnum.EXPONENT]: { color: MATH, icon: 'superscript', category: 'math', width: 192 },
  [NodeTypeEnum.ROUND]: { color: MATH, icon: 'circle-dot', category: 'math', width: 192 },
  [NodeTypeEnum.MIN]: { color: MATH, icon: 'arrow-down', category: 'math', width: 192 },
  [NodeTypeEnum.MAX]: { color: MATH, icon: 'arrow-up', category: 'math', width: 192 },

  [NodeTypeEnum.AND]: { color: CONTROL, icon: 'git-merge', category: 'control', width: 170 },
  [NodeTypeEnum.OR]: { color: CONTROL, icon: 'git-branch', category: 'control', width: 170 },
  [NodeTypeEnum.NOT]: { color: CONTROL, icon: 'ban', category: 'control', width: 170 },
  [NodeTypeEnum.EQUAL]: { color: CONTROL, icon: 'equal', category: 'control', width: 190 },
  [NodeTypeEnum.COMPARE]: { color: CONTROL, icon: 'arrow-left-right', category: 'control', width: 200 },
  [NodeTypeEnum.HAS_VALUE]: { color: CONTROL, icon: 'check', category: 'control', width: 190 },
  [NodeTypeEnum.IF]: { color: CONTROL, icon: 'split', category: 'control', width: 230 },

  [NodeTypeEnum.SOL_TO_LAMPORTS]: { color: UTILS, icon: 'arrow-right', category: 'utils', width: 210 },
  [NodeTypeEnum.LAMPORTS_TO_SOL]: { color: UTILS, icon: 'arrow-left', category: 'utils', width: 210 },
  [NodeTypeEnum.VALID_PUBLIC_KEY]: { color: UTILS, icon: 'shield-check', category: 'utils', width: 220 },
  [NodeTypeEnum.ATA]: { color: UTILS, icon: 'wallet', category: 'utils', width: 200 },
  [NodeTypeEnum.TOKEN_AMOUNT_TO_RAW]: { color: UTILS, icon: 'coins', category: 'utils', width: 230 },
  [NodeTypeEnum.RAW_TO_TOKEN_AMOUNT]: { color: UTILS, icon: 'coins', category: 'utils', width: 230 },
  [NodeTypeEnum.RENT_EXEMPT]: { color: UTILS, icon: 'home', category: 'utils', width: 210 },
  [NodeTypeEnum.STRING_ENCODE]: { color: UTILS, icon: 'binary', category: 'utils', width: 240 },
  [NodeTypeEnum.STRING_DECODE]: { color: UTILS, icon: 'binary', category: 'utils', width: 240 },

  [NodeTypeEnum.TRANSACTION_BUILDER]: { color: TX, icon: 'wrench', category: 'tx', width: 160 },
  [NodeTypeEnum.TRANSACTION]: { color: TX, icon: 'send', category: 'tx', width: 280 },
  [NodeTypeEnum.TRANSACTION_VIEW]: { color: TX, icon: 'receipt', category: 'tx', width: 280 },

  [NodeTypeEnum.NETWORK]: { color: NETWORK, icon: 'globe', category: 'network', width: 220 },
  [NodeTypeEnum.BALANCE]: { color: NETWORK, icon: 'circle-dollar-sign', category: 'network', width: 220 },

  [NodeTypeEnum.IDL]: { color: PROGRAMS, icon: 'file-code', category: 'programs', width: 320 },
  [NodeTypeEnum.PROGRAM_INSTRUCTIONS]: { color: PROGRAMS, icon: 'list', category: 'programs', width: 320 },
  [NodeTypeEnum.PROGRAM_ACCOUNT]: { color: PROGRAMS, icon: 'database', category: 'programs', width: 320 },
  [NodeTypeEnum.INSTRUCTIONS]: { color: PROGRAMS, icon: 'play', category: 'programs', width: 280 },
  [NodeTypeEnum.PDA]: { color: PROGRAMS, icon: 'key-round', category: 'programs', width: 180 },

  [NodeTypeEnum.WALLET]: { color: WALLET, icon: 'wallet', category: 'wallet', width: 220 },

  [NodeTypeEnum.HASH]: { color: CRYPTO, icon: 'hash', category: 'crypto', width: 180 },
  [NodeTypeEnum.KEYPAIR]: { color: CRYPTO, icon: 'key', category: 'crypto', width: 180 },
  [NodeTypeEnum.SIGN]: { color: CRYPTO, icon: 'signature', category: 'crypto', width: 180 },
  [NodeTypeEnum.VERIFY_SIGNATURE]: { color: CRYPTO, icon: 'shield-check', category: 'crypto', width: 200 },
  [NodeTypeEnum.PRIVATE_KEY]: { color: CRYPTO, icon: 'lock', category: 'crypto', width: 280 },

  [NodeTypeEnum.STRING_COMBINE]: { color: STRING, icon: 'merge', category: 'string', width: 240 },
  [NodeTypeEnum.STRING_LENGTH]: { color: STRING, icon: 'ruler', category: 'string', width: 200 },
  [NodeTypeEnum.STRING_SUBSTRING]: { color: STRING, icon: 'scissors', category: 'string', width: 240 },
  [NodeTypeEnum.STRING_SPLIT]: { color: STRING, icon: 'split', category: 'string', width: 240 },
  [NodeTypeEnum.STRING_SEARCH]: { color: STRING, icon: 'search', category: 'string', width: 200 },
  [NodeTypeEnum.STRING_REPLACE]: { color: STRING, icon: 'replace', category: 'string', width: 240 },
}

export const getNodeStyles = (nodeType?: NodeType) => {
  if (!nodeType) return nodeStyles[NodeTypeEnum.TEXT]
  return nodeStyles[nodeType]
}
