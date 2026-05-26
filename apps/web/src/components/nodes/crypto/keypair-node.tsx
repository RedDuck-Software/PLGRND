import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { CustomNode } from '../../ui/custom-node'
import type { KeypairNodeData, KeypairNodeType } from '@/types/nodes/crypto/keypair-node'
import { Keypair } from '@solana/web3.js'
import { useNodeActions } from '@/hooks/flow/use-node-actions'
import { useTypedNodesData } from '@/hooks/flow/use-typed-nodes-data'
import type { ActionsFor, NodeTypeEnum, TargetFieldsForEnum } from '@/types/node'
import { useCallback, useEffect } from 'react'
import { keypairFromSecretInput, transformKeypair } from '@/utils/crypto/crypto.utils'
import type { NodeProps } from '@xyflow/react'

export const KeypairNode = (props: NodeProps<KeypairNodeType>) => {
  const { updateNodeData } = useTypedReactFlow()
  const resolved = useTypedNodesData<TargetFieldsForEnum<NodeTypeEnum.KEYPAIR>>(props.id)

  const inputPrivateKey = ((resolved.privateKey?.value as string | undefined) ?? '').trim()
  const hasInput = Boolean(inputPrivateKey)

  // Derive the keypair from a connected secret key whenever it changes. The input is
  // auto-detected as a base58 secret key/seed or a 32-byte hex hash (used as a seed).
  useEffect(() => {
    if (!inputPrivateKey) return
    const keypair = keypairFromSecretInput(inputPrivateKey)
    if (keypair) {
      updateNodeData<KeypairNodeData>(props.id, transformKeypair(keypair))
    } else {
      updateNodeData<KeypairNodeData>(props.id, { privateKey: inputPrivateKey, publicKey: '' })
    }
  }, [inputPrivateKey, updateNodeData, props.id])

  // Generate a random keypair when no private key is connected (on mount and when the input is removed).
  useEffect(() => {
    if (hasInput) return
    const keypair = Keypair.generate()
    updateNodeData<KeypairNodeData>(props.id, transformKeypair(keypair))
  }, [hasInput, updateNodeData, props.id])

  const handleGenerateKeypair = useCallback(() => {
    if (hasInput) return
    const keypair = Keypair.generate()
    updateNodeData<KeypairNodeData>(props.id, transformKeypair(keypair))
  }, [hasInput, updateNodeData, props.id])

  const actions = useNodeActions<ActionsFor<NodeTypeEnum.KEYPAIR>>(props.type, {
    Generate: handleGenerateKeypair,
  })

  return <CustomNode {...props} actions={actions}></CustomNode>
}
