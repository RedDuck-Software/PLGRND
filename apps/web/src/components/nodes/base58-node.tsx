import { useEffect, useMemo } from 'react'
import { CustomNode } from '../ui/custom-node'
import type { Base58NodeData, Base58NodeType, Base58Mode } from '@/types/nodes/base58-node'
import type { NodeTypeEnum, TargetFieldsForEnum } from '@/types/node'
import { useTypedNodesData } from '@/hooks/flow/use-typed-nodes-data'
import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import { type NodeProps } from '@xyflow/react'
import bs58 from 'bs58'

const encodeBase58 = (input: string): string => {
  try {
    const bytes = new TextEncoder().encode(input)
    return bs58.encode(bytes)
  } catch {
    return ''
  }
}

const decodeBase58 = (input: string): string => {
  try {
    const bytes = bs58.decode(input)
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

export const Base58Node = (props: NodeProps<Base58NodeType>) => {
  const { updateNodeData } = useTypedReactFlow()
  const resolved = useTypedNodesData<TargetFieldsForEnum<NodeTypeEnum.BASE58>>(props.id)

  const input = useMemo(() => String(resolved.input?.value ?? ''), [resolved])
  const mode: Base58Mode = props.data.mode ?? 'encode'

  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'encode' ? encodeBase58(input) : decodeBase58(input)
  }, [input, mode])

  useEffect(() => {
    updateNodeData<Base58NodeData>(props.id, { output })
  }, [output, props.id, updateNodeData])

  const nodeStyles = getNodeStyles(props.type)

  return (
    <CustomNode {...props}>
      <Select
        value={mode}
        onValueChange={(v) => updateNodeData<Base58NodeData>(props.id, { mode: v as Base58Mode })}
      >
        <SelectTrigger color={nodeStyles.color}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="encode">Encode</SelectItem>
          <SelectItem value="decode">Decode</SelectItem>
        </SelectContent>
      </Select>
    </CustomNode>
  )
}
