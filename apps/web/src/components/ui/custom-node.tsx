import { cn } from '@/lib/utils'
import { NodeTypeEnum, type NodeType } from '@/types/node'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import {
  Handle,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
  useNodeConnections,
  type NodeProps,
} from '@xyflow/react'
import type { PropsWithChildren } from 'react'
import { getNodeConfig } from '@/utils/node/node-config-registry'
import type { NodeActionConfig } from '@/types/node-action'
import { generateNodeId } from '@/utils/crypto/crypto.utils'
import type { HandleConfig } from '@/types/node-handle'
import { BaseTooltip } from '@/components/ui/tooltip'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'

interface Props extends PropsWithChildren, NodeProps {
  className?: string
  actions?: NodeActionConfig[]
  extraHandles?: HandleConfig[]
}

const handleSpacing = 22

// Convert "TEXT_INPUT" -> "Text Input"
const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

export const CustomNode = ({
  className,
  children,
  selected,
  type,
  id,
  actions,
  positionAbsoluteX,
  positionAbsoluteY,
  extraHandles,
}: Props) => {
  const { setNodes, setEdges } = useReactFlow()
  const sourceConnections = useNodeConnections({ handleType: 'source', id })
  const targetConnections = useNodeConnections({ handleType: 'target', id })
  const updateNodeInternals = useUpdateNodeInternals()

  const nodeStyles = getNodeStyles(type as NodeType)
  const nodeConfig = getNodeConfig(type as NodeType)
  const color = nodeStyles.color

  const allHandles = [...nodeConfig.handles, ...(extraHandles ?? [])]

  const handleIndices: Record<string, number> = {}
  const handleCounts: Record<string, number> = {}
  allHandles.forEach((h) => {
    const key = String(h.position)
    handleCounts[key] = (handleCounts[key] ?? 0) + 1
  })
  actions?.forEach((action) => {
    const posKey = String(action.position)
    handleCounts[posKey] = (handleCounts[posKey] ?? 0) + 1
  })

  const maxHandleCount = Math.max(...Object.values(handleCounts), 0)

  const addDisplayNodeOnDoubleClick = (handleId: string, position: Position) => {
    if (position === Position.Left) return
    const newPosition = {
      x: positionAbsoluteX + (nodeStyles.width ?? 200) + 50,
      y: positionAbsoluteY,
    }
    const newId = generateNodeId()
    setNodes((nds) =>
      nds.concat({ id: newId, type: NodeTypeEnum.DISPLAY, position: newPosition, data: {} })
    )
    const targetHandle = newId + '-' + 'input' + '-' + Position.Left
    setTimeout(() => {
      updateNodeInternals(newId)
      setEdges((eds) =>
        eds.concat({
          id: 'xy-edge__' + handleId + '-' + targetHandle,
          source: id,
          sourceHandle: handleId,
          target: newId,
          targetHandle,
        })
      )
    }, 0)
  }

  const titleLabel = toTitleCase(nodeConfig.label)

  return (
    <div
      style={{ width: nodeStyles.width }}
      className="relative text-foreground"
    >
      <div
        className={cn(
          'group/node relative rounded-[10px] overflow-hidden transition-all duration-150',
          'bg-[#13131D] hover:bg-[#15151F]',
          className
        )}
        style={{
          border: `1px solid ${selected ? `${color}cc` : `${color}66`}`,
          boxShadow: selected
            ? `0 0 0 2px ${color}33, 0 8px 28px ${color}40`
            : `0 6px 22px ${color}22`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 h-8"
          style={{ backgroundColor: `${color}1F` }}
        >
          {/* Icon box */}
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px]"
            style={{ backgroundColor: color }}
          >
            <DynamicIcon
              name={nodeStyles.icon as IconName}
              size={12}
              color="#08080F"
              strokeWidth={2.5}
            />
          </div>
          {/* Title */}
          <span
            className="text-[12px] font-bold text-white truncate"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {titleLabel}
          </span>
          {/* Category badge */}
          <span
            className="ml-auto rounded-[4px] px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wide font-mono"
            style={{
              backgroundColor: `${color}22`,
              color,
            }}
          >
            {nodeStyles.category}
          </span>
          <div className="opacity-60 hover:opacity-100 transition-opacity shrink-0">
            <BaseTooltip type={type as NodeType} />
          </div>
        </div>

        {/* Body */}
        <div
          className="relative flex flex-col px-3 py-2.5 gap-1.5"
          style={{ minHeight: maxHandleCount * handleSpacing + 8 }}
        >
          {/* Render handle rows: left = inputs, right = outputs */}
          {allHandles.map((handle) => {
            const posKey = String(handle.position)
            const index = handleIndices[posKey] ?? 0
            handleIndices[posKey] = index + 1

            const handleId = id + '-' + handle.dataField + '-' + handle.position
            const isLeft = handle.position === Position.Left
            const isConnected =
              handle.type === 'source'
                ? (sourceConnections ?? []).some((c) => c.sourceHandle === handleId)
                : (targetConnections ?? []).some((c) => c.targetHandle === handleId)

            const topPx = index * handleSpacing + 12

            return (
              <Handle
                key={handleId}
                id={handleId}
                onDoubleClick={() => addDisplayNodeOnDoubleClick(handleId, handle.position)}
                type={handle.type}
                position={handle.position}
                isConnectable
                className="!cursor-crosshair"
                style={{
                  position: 'absolute',
                  top: topPx,
                  [isLeft ? 'left' : 'right']: 12,
                  width: 8,
                  height: 8,
                  minWidth: 8,
                  minHeight: 8,
                  borderRadius: 999,
                  border: `1.5px solid #08080F`,
                  background: color,
                  boxShadow: isConnected ? `0 0 0 2px ${color}33` : 'none',
                  zIndex: 10,
                }}
                data-field={handle.dataField}
                data-id={handleId}
                data-handle-type={handle.type}
                data-type={(handle as HandleConfig & { dataType?: string }).dataType}
                data-max-connections={handle.maxConnections}
              >
                {handle.label && (
                  <span
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono text-[#C8C8DC] leading-none"
                    style={{
                      [isLeft ? 'left' : 'right']: 14,
                    }}
                  >
                    {handle.label.includes('\n')
                      ? handle.label.split('\n').map((line, i) => <div key={i}>{line}</div>)
                      : handle.label}
                  </span>
                )}
              </Handle>
            )
          })}

          {/* Action buttons */}
          {actions?.map((action) => {
            const posKey = String(action.position)
            const index = handleIndices[posKey] ?? 0
            handleIndices[posKey] = index + 1
            const isLeft = action.position === Position.Left
            const topPx = index * handleSpacing + 12

            return (
              <button
                onClick={action.onClick}
                key={id + '-' + action.label + '-' + action.position}
                className="absolute flex items-center gap-1 cursor-pointer transition-all active:scale-95 z-20"
                style={{
                  top: topPx - 4,
                  [isLeft ? 'left' : 'right']: 6,
                  flexDirection: isLeft ? 'row' : 'row-reverse',
                }}
              >
                <div
                  className="rounded-[3px] p-0.5"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[8px] leading-none font-mono text-muted-foreground">
                  {action.label}
                </span>
              </button>
            )
          })}

          {/* Custom children content (renders below handles area) */}
          {children && (
            <div
              className="relative"
              style={{ marginTop: maxHandleCount * handleSpacing }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
