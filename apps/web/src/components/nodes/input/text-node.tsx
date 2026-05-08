import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { CustomNode } from '../../ui/custom-node'
import { useRef, useState } from 'react'
import type { TextNodeType, TextNodeData } from '@/types/nodes/input/text-node'
import { Input } from '../../ui/input'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import type { NodeProps } from '@xyflow/react'
import { useBlurOnOutsideClick } from '@/hooks/use-blur-on-outside-click'

export const TextNode = (props: NodeProps<TextNodeType>) => {
  const [text, setText] = useState(props.data.text)
  const { updateNodeData } = useTypedReactFlow()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useBlurOnOutsideClick(containerRef, inputRef)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    updateNodeData<TextNodeData>(props.id, { text: e.target.value })
  }

  const nodeStyles = getNodeStyles(props.type)
  return (
    <CustomNode {...props}>
      <div ref={containerRef}>
        <Input ref={inputRef} value={text} color={nodeStyles.color} onChange={handleChange} />
      </div>
    </CustomNode>
  )
}
