import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { CustomNode } from '../../ui/custom-node'
import { useState } from 'react'
import { Input } from '../../ui/input'
import type { NumberNodeData, NumberNodeType } from '@/types/nodes/input/number-node'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import type { NodeProps } from '@xyflow/react'

export const NumberNode = (props: NodeProps<NumberNodeType>) => {
  const [number, setNumber] = useState(props.data.number != null ? String(props.data.number) : '')
  const { updateNodeData } = useTypedReactFlow()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value
    raw = raw.replace(/,/g, '.')
    raw = raw.replace(/[^\d.-]/g, '')
    const hasLeadingMinus = raw.startsWith('-')
    raw = raw.replace(/-/g, '')
    if (hasLeadingMinus) raw = '-' + raw
    const parts = raw.split('.')
    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('')

    setNumber(raw)
    const parsed = parseFloat(raw)
    if (!isNaN(parsed)) updateNodeData<NumberNodeData>(props.id, { number: parsed })
  }

  const handleIncrement = () => {
    const parsed = !number ? 0 : Number(number)

    setNumber(String(parsed + 1))
    updateNodeData<NumberNodeData>(props.id, { number: parsed + 1 })
  }
  const handleDecrement = () => {
    const parsed = !number ? 0 : Number(number)

    setNumber(String(parsed - 1))
    updateNodeData<NumberNodeData>(props.id, { number: parsed - 1 })
  }

  const nodeStyles = getNodeStyles(props.type)

  return (
    <CustomNode {...props}>
      <div className="relative">
        <Input value={number} onChange={handleChange} color={nodeStyles.color} />
        <button
          style={
            {
              '--primary': nodeStyles.color,
            } as React.CSSProperties
          }
          className="absolute right-0.5 transition-colors active:text-primary top-1 w-3 h-3 cursor-pointer"
          onClick={handleIncrement}
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          style={
            {
              '--primary': nodeStyles.color,
            } as React.CSSProperties
          }
          className="absolute right-0.5 bottom-0 w-3 h-3 cursor-pointer transition-colors active:text-primary"
          onClick={handleDecrement}
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </CustomNode>
  )
}
