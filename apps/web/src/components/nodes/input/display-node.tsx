import { CustomNode } from '../../ui/custom-node'
import { useEffect, useMemo } from 'react'
import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { useTypedNodesData } from '@/hooks/flow/use-typed-nodes-data'
import type { NodeTypeEnum, TargetFieldsForEnum } from '@/types/node'
import type { DisplayNodeData, DisplayNodeType } from '@/types/nodes/input/display-node'
import { Copy } from '../../ui/copy'
import type { NodeProps } from '@xyflow/react'
import { formatDisplayValue } from '@/utils/node/display-node.utils'

export const DisplayNode = (props: NodeProps<DisplayNodeType>) => {
  const { updateNodeData } = useTypedReactFlow()
  const resolved = useTypedNodesData<TargetFieldsForEnum<NodeTypeEnum.DISPLAY>>(props.id)

  const inputData = useMemo(() => formatDisplayValue(resolved.input?.value), [resolved.input?.value])

  useEffect(() => {
    updateNodeData<DisplayNodeData>(props.id, { text: inputData })
  }, [inputData, props.id, updateNodeData])

  return (
    <CustomNode {...props}>
      <Copy data={inputData} className="max-h-48 overflow-auto font-mono whitespace-pre-wrap" />
    </CustomNode>
  )
}
