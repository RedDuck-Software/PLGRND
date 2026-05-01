import { SignNode } from '@/components/nodes/sign-node'
import { HashNode } from '@/components/nodes/hash-node'
import { KeypairNode } from '@/components/nodes/keypair-node'
import { PrivateKeyNode } from '@/components/nodes/private-key-node'
import { TextNode } from '@/components/nodes/text-node'
import { NodeTypeEnum, type NodeType } from '@/types/node'
import { DisplayNode } from '@/components/nodes/display-node'
import { NumberNode } from '@/components/nodes/number-node'
import { VerifySignatureNode } from '@/components/nodes/verify-signature-node'
import { NetworkNode } from '@/components/nodes/network-node'
import { BalanceNode } from '@/components/nodes/balance-node'
import { TransactionViewNode } from '@/components/nodes/transaction-view-node'
import { PdaNode } from '@/components/nodes/pda-node'
import { TransactionBuilderNode } from '@/components/nodes/transaction-builder-node'
import { InstructionsNode } from '@/components/nodes/instructions-node'
import { TransactionNode } from '../../components/nodes/transaction-node'
import { IdlNode } from '@/components/nodes/idl-node'
import { ProgramInstructionsNode } from '@/components/nodes/program-instructions-node'
import { TokenBalanceNode } from '@/components/nodes/token-balance-node'
import { Base58Node } from '@/components/nodes/base58-node'
import { Base64Node } from '@/components/nodes/base64-node'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeMap: Record<NodeType, React.ComponentType<any>> = {
  [NodeTypeEnum.TEXT]: TextNode,
  [NodeTypeEnum.HASH]: HashNode,
  [NodeTypeEnum.KEYPAIR]: KeypairNode,
  [NodeTypeEnum.PRIVATE_KEY]: PrivateKeyNode,
  [NodeTypeEnum.SIGN]: SignNode,
  [NodeTypeEnum.DISPLAY]: DisplayNode,
  [NodeTypeEnum.NUMBER]: NumberNode,
  [NodeTypeEnum.VERIFY_SIGNATURE]: VerifySignatureNode,
  [NodeTypeEnum.NETWORK]: NetworkNode,
  [NodeTypeEnum.BALANCE]: BalanceNode,
  [NodeTypeEnum.TRANSACTION_VIEW]: TransactionViewNode,
  [NodeTypeEnum.PDA]: PdaNode,
  [NodeTypeEnum.TRANSACTION_BUILDER]: TransactionBuilderNode,
  [NodeTypeEnum.INSTRUCTIONS]: InstructionsNode,
  [NodeTypeEnum.TRANSACTION]: TransactionNode,
  [NodeTypeEnum.IDL]: IdlNode,
  [NodeTypeEnum.PROGRAM_INSTRUCTIONS]: ProgramInstructionsNode,
  [NodeTypeEnum.TOKEN_BALANCE]: TokenBalanceNode,
  [NodeTypeEnum.BASE58]: Base58Node,
  [NodeTypeEnum.BASE64]: Base64Node,
}
