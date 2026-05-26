import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { CustomNode } from '../../ui/custom-node'
import type { MnemonicNodeData, MnemonicNodeType } from '@/types/nodes/crypto/mnemonic-node'
import { useNodeActions } from '@/hooks/flow/use-node-actions'
import { useTypedNodesData } from '@/hooks/flow/use-typed-nodes-data'
import type { ActionsFor, NodeTypeEnum, TargetFieldsForEnum } from '@/types/node'
import { useCallback, useEffect } from 'react'
import { generateMnemonic, mnemonicToKeypair } from '@/utils/crypto/crypto.utils'
import bs58 from 'bs58'
import type { NodeProps } from '@xyflow/react'

export const MnemonicNode = (props: NodeProps<MnemonicNodeType>) => {
  const { updateNodeData } = useTypedReactFlow()
  const resolved = useTypedNodesData<TargetFieldsForEnum<NodeTypeEnum.MNEMONIC>>(props.id)

  const inputMnemonic = ((resolved.mnemonic?.value as string | undefined) ?? '').trim()
  const hasInput = Boolean(inputMnemonic)

  const setFromMnemonic = useCallback(
    (mnemonic: string) => {
      const keypair = mnemonicToKeypair(mnemonic)
      updateNodeData<MnemonicNodeData>(props.id, {
        mnemonic,
        privateKey: keypair ? bs58.encode(keypair.secretKey) : '',
      })
    },
    [updateNodeData, props.id]
  )

  // Derive the private key from a connected mnemonic whenever it changes.
  useEffect(() => {
    if (!inputMnemonic) return
    setFromMnemonic(inputMnemonic)
  }, [inputMnemonic, setFromMnemonic])

  // Generate a random mnemonic when none is connected (on mount and when the input is removed).
  useEffect(() => {
    if (hasInput) return
    setFromMnemonic(generateMnemonic())
  }, [hasInput, setFromMnemonic])

  const handleGenerate = useCallback(() => {
    if (hasInput) return
    setFromMnemonic(generateMnemonic())
  }, [hasInput, setFromMnemonic])

  const actions = useNodeActions<ActionsFor<NodeTypeEnum.MNEMONIC>>(props.type, {
    Generate: handleGenerate,
  })

  return <CustomNode {...props} actions={actions}></CustomNode>
}
