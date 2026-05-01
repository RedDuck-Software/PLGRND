import { useEffect, useMemo } from 'react'
import { CustomNode } from '../ui/custom-node'
import type { Base64NodeData, Base64NodeType, Base64Mode } from '@/types/nodes/base64-node'
import type { NodeTypeEnum, TargetFieldsForEnum } from '@/types/node'
import { useTypedNodesData } from '@/hooks/flow/use-typed-nodes-data'
import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import { type NodeProps } from '@xyflow/react'
import { Buffer } from 'buffer'

const encodeBase64 = (input: string): string => {
  try {
    return Buffer.from(input, 'utf8').toString('base64')
  } catch {
    return ''
  }
}

const decodeBase64 = (input: string): string => {
  try {
    return Buffer.from(input, 'base64').toString('utf8')
  } catch {
    return ''
  }
}

export const Base64Node = (props: NodeProps<Base64NodeType>) => {
  const { updateNodeData } = useTypedReactFlow()
  const resolved = useTypedNodesData<TargetFieldsForEnum<NodeTypeEnum.BASE64>>(props.id)

  const input = useMemo(() => String(resolved.input?.value ?? ''), [resolved])
  const mode: Base64Mode = props.data.mode ?? 'encode'

  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'encode' ? encodeBase64(input) : decodeBase64(input)
  }, [input, mode])

  useEffect(() => {
    updateNodeData<Base64NodeData>(props.id, { output })
  }, [output, props.id, updateNodeData])

  const nodeStyles = getNodeStyles(props.type)

  return (
    <CustomNode {...props}>
      <Select
        value={mode}
        onValueChange={(v) => updateNodeData<Base64NodeData>(props.id, { mode: v as Base64Mode })}
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
