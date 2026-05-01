import { useCallback, useEffect, useMemo, useState } from 'react'
import { CustomNode } from '../ui/custom-node'
import type { TokenBalanceNodeData, TokenBalanceNodeType } from '@/types/nodes/token-balance-node'
import { useNodeActions } from '@/hooks/flow/use-node-actions'
import type { ActionsFor, NodeTypeEnum, TargetFieldsForEnum } from '@/types/node'
import { useTokenBalance } from '@/hooks/solana/query/use-token-balance'
import { useTypedNodesData } from '@/hooks/flow/use-typed-nodes-data'
import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import type { Network } from '@/types/network'
import { type NodeProps } from '@xyflow/react'

export const TokenBalanceNode = (props: NodeProps<TokenBalanceNodeType>) => {
  const { updateNodeData } = useTypedReactFlow()
  const [key, setKey] = useState(1)
  const updateKey = useCallback(() => setKey((k) => k + 1), [])

  const resolved = useTypedNodesData<TargetFieldsForEnum<NodeTypeEnum.TOKEN_BALANCE>>(props.id)

  const data = useMemo(
    () => ({
      pubkey: (resolved.pubkey?.value as string) ?? '',
      network: (resolved.network?.value as Network) ?? null,
      mint: (resolved.mint?.value as string) ?? '',
    }),
    [resolved]
  )

  const { data: tokenBalanceData } = useTokenBalance(data.pubkey, data.network, data.mint, key)

  useEffect(() => {
    if (tokenBalanceData) {
      updateNodeData<TokenBalanceNodeData>(props.id, {
        balance: tokenBalanceData.uiBalance,
        balanceRaw: tokenBalanceData.rawBalance,
      })
    }
  }, [tokenBalanceData, props.id, updateNodeData])

  const actions = useNodeActions<ActionsFor<NodeTypeEnum.TOKEN_BALANCE>>(props.type, {
    Refresh: updateKey,
  })

  return <CustomNode {...props} actions={actions} />
}
