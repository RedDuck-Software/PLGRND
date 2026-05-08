import type { NodeType } from '@/types/node'
import type { XYPosition } from '@xyflow/react'
import { useRef, useState, type RefObject } from 'react'
import { useDraggable } from '@neodrag/react'
import { cn } from '@/lib/utils'
import { getNodeConfig } from '@/utils/node/node-config-registry'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'

export interface DraggableNodeProps {
  type: NodeType
  onDrop: (nodeType: NodeType, position: XYPosition) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  className?: string
  categoryColor?: string
}

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

export const DraggableNode = ({
  type,
  onDrop,
  onDragStart,
  onDragEnd,
  className,
  categoryColor,
}: DraggableNodeProps) => {
  const draggableRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<XYPosition>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  useDraggable(draggableRef as RefObject<HTMLElement>, {
    position,
    onDragStart: () => {
      setIsDragging(true)
      onDragStart?.()
    },
    onDrag: ({ offsetX, offsetY }) => {
      setPosition({ x: offsetX, y: offsetY })
    },
    onDragEnd: ({ event }) => {
      setIsDragging(false)
      setPosition({ x: 0, y: 0 })
      onDrop(type, { x: event.clientX, y: event.clientY })
      onDragEnd?.()
    },
  })

  const nodeConfig = getNodeConfig(type as NodeType)
  const nodeStyles = getNodeStyles(type as NodeType)
  const color = categoryColor ?? nodeStyles.color
  const title = toTitleCase(nodeConfig.label)

  const handleClick = () => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    onDrop(type, { x: centerX, y: centerY })
  }

  return (
    <div
      ref={draggableRef}
      onClick={handleClick}
      className={cn('dndnode pointer-events-auto', isDragging && 'fixed', className)}
      style={{ zIndex: isDragging ? 99999 : undefined }}
    >
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-md px-2 py-1.5 my-0.5',
          'cursor-grab active:cursor-grabbing select-none',
          'hover:bg-[#13131D] transition-colors group',
          isDragging && 'pointer-events-none'
        )}
        style={
          isDragging
            ? {
                background: '#13131D',
                border: `1px solid ${color}66`,
                boxShadow: `0 12px 32px ${color}33, 0 0 0 1px ${color}22`,
              }
            : undefined
        }
      >
        {/* Icon box */}
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] transition-all group-hover:scale-110"
          style={{
            backgroundColor: isDragging ? color : `${color}1F`,
          }}
        >
          <DynamicIcon
            name={nodeStyles.icon as IconName}
            size={11}
            color={isDragging ? '#08080F' : color}
            strokeWidth={2.4}
          />
        </div>
        {/* Label */}
        <span
          className={cn(
            'flex-1 truncate text-[12px] transition-colors',
            isDragging ? 'text-foreground font-medium' : 'text-[#C8C8DC] group-hover:text-foreground'
          )}
        >
          {title}
        </span>
      </div>
    </div>
  )
}
