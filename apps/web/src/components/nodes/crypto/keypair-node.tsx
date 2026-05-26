import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { CustomNode } from '../../ui/custom-node'
import type { KeypairNodeData, KeypairNodeType } from '@/types/nodes/crypto/keypair-node'
import { Keypair } from '@solana/web3.js'
import { useNodeActions } from '@/hooks/flow/use-node-actions'
import { useTypedNodesData } from '@/hooks/flow/use-typed-nodes-data'
import type { ActionsFor, NodeTypeEnum, TargetFieldsForEnum } from '@/types/node'
import { useCallback, useEffect } from 'react'
import { transformKeypair } from '@/utils/crypto/crypto.utils'
import bs58 from 'bs58'
import type { NodeProps } from '@xyflow/react'

export const KeypairNode = (props: NodeProps<KeypairNodeType>) => {
  const { updateNodeData } = useTypedReactFlow()
  const resolved = useTypedNodesData<TargetFieldsForEnum<NodeTypeEnum.KEYPAIR>>(props.id)

  const inputPrivateKey = ((resolved.privateKey?.value as string | undefined) ?? '').trim()
  const hasInput = Boolean(inputPrivateKey)

  // Derive the keypair from a connected private key whenever it changes.
  useEffect(() => {
    if (!inputPrivateKey) return
    try {
      const keypair = Keypair.fromSecretKey(bs58.decode(inputPrivateKey))
      updateNodeData<KeypairNodeData>(props.id, transformKeypair(keypair))
    } catch {
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
