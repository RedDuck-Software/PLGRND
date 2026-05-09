import { useState } from 'react'
import {
  Maximize,
  MousePointer2,
  Hand,
  GitBranch,
  Share2,
  LayoutGrid,
  Eye,
  Plus,
  Minus,
  ChevronRight,
} from 'lucide-react'
import { useReactFlow, useViewport, type Edge, type Node } from '@xyflow/react'
import { toast } from 'sonner'
import { useFlowStore } from '@/stores/flow-store'
import { buildShareUrl } from '@/utils/flow/share'
import { cn } from '@/lib/utils'

type Tool = 'select' | 'pan' | 'connect'

const LAYOUT_COLUMN_GAP = 340
const LAYOUT_ROW_GAP = 160

const autoLayoutNodes = (nodes: Node[], edges: Edge[]) => {
  const nodeIds = new Set(nodes.map((node) => node.id))
  const incomingCount = new Map(nodes.map((node) => [node.id, 0]))
  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]))

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return
    outgoing.get(edge.source)?.push(edge.target)
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1)
  })

  const depth = new Map(nodes.map((node) => [node.id, 0]))
  const queue = nodes
    .filter((node) => (incomingCount.get(node.id) ?? 0) === 0)
    .map((node) => node.id)

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const id = queue[cursor]
    const nextDepth = (depth.get(id) ?? 0) + 1
    outgoing.get(id)?.forEach((targetId) => {
      depth.set(targetId, Math.max(depth.get(targetId) ?? 0, nextDepth))
      incomingCount.set(targetId, (incomingCount.get(targetId) ?? 1) - 1)
      if (incomingCount.get(targetId) === 0) queue.push(targetId)
    })
  }

  const columns = new Map<number, Node[]>()
  nodes.forEach((node) => {
    const column = depth.get(node.id) ?? 0
    columns.set(column, [...(columns.get(column) ?? []), node])
  })

  return nodes.map((node) => {
    const column = depth.get(node.id) ?? 0
    const columnNodes = columns.get(column) ?? []
    const row = columnNodes.findIndex((columnNode) => columnNode.id === node.id)
    const yOffset = ((columnNodes.length - 1) * LAYOUT_ROW_GAP) / 2

    return {
      ...node,
      position: {
        x: column * LAYOUT_COLUMN_GAP,
        y: row * LAYOUT_ROW_GAP - yOffset,
      },
    }
  })
}

export function CanvasToolbar() {
  const [tool, setTool] = useState<Tool>('select')
  const { zoom } = useViewport()
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const zoomPercent = Math.round(zoom * 100)

  const handleZoomIn = () => {
    void zoomIn()
  }
  const handleZoomOut = () => {
    void zoomOut()
  }
  const handleFit = () => {
    void fitView({ duration: 200 })
  }

  const handleShare = async () => {
    const { nodes, edges, variables } = useFlowStore.getState()
    const url = buildShareUrl({ nodes, edges, variables, viewport: undefined })
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleAutoLayout = () => {
    const { nodes, edges, setNodes } = useFlowStore.getState()
    if (nodes.length < 2) {
      toast.info('Add at least two nodes to auto layout')
      return
    }

    setNodes(autoLayoutNodes(nodes, edges))
    toast.success('Flow auto-arranged')
    window.requestAnimationFrame(() => {
      void fitView({ duration: 200, padding: 0.2 })
    })
  }

  return (
    <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-[#1F1F2E] bg-background px-4">
      {/* Left — breadcrumb + zoom + fit */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#8B8B9E]">Workspace</span>
          <ChevronRight className="h-3 w-3 text-[#3A3A4D]" />
          <span className="text-[11px] font-mono text-foreground">Untitled flow</span>
        </div>
        <div className="mx-1 h-4 w-px bg-[#1F1F2E]" />
        <div className="flex items-center gap-0.5 rounded-md border border-[#1F1F2E] bg-[#13131D]">
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-6 w-6 items-center justify-center text-[#8B8B9E] hover:text-foreground transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="px-1 text-[10px] font-mono text-[#C8C8DC] tabular-nums w-9 text-center">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-6 w-6 items-center justify-center text-[#8B8B9E] hover:text-foreground transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="mx-1 h-4 w-px bg-[#1F1F2E]" />
        <ToolBtn icon={<Maximize className="h-3.5 w-3.5" />} title="Fit view" onClick={handleFit} />
      </div>

      {/* Center — tool modes */}
      <div className="flex items-center gap-0.5 rounded-md border border-[#1F1F2E] bg-[#13131D] p-0.5">
        <ModeBtn
          icon={<MousePointer2 className="h-3.5 w-3.5" />}
          active={tool === 'select'}
          onClick={() => setTool('select')}
          title="Select (V)"
        />
        <ModeBtn
          icon={<Hand className="h-3.5 w-3.5" />}
          active={tool === 'pan'}
          onClick={() => setTool('pan')}
          title="Pan (H)"
        />
        <ModeBtn
          icon={<GitBranch className="h-3.5 w-3.5" />}
          active={tool === 'connect'}
          onClick={() => setTool('connect')}
          title="Connect (C)"
        />
      </div>

      {/* Right — share + layout + view */}
      <div className="flex items-center gap-1">
        <ToolBtn
          icon={<Share2 className="h-3.5 w-3.5" />}
          title="Share"
          onClick={handleShare}
        />
        <ToolBtn
          icon={<LayoutGrid className="h-3.5 w-3.5" />}
          title="Auto layout"
          onClick={handleAutoLayout}
        />
        <ToolBtn icon={<Eye className="h-3.5 w-3.5" />} title="Preview" />
      </div>
    </div>
  )
}

function ToolBtn({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md text-[#8B8B9E] hover:bg-[#13131D] hover:text-foreground transition-colors"
    >
      {icon}
    </button>
  )
}

function ModeBtn({
  icon,
  active,
  onClick,
  title,
}: {
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded transition-colors',
        active
          ? 'bg-[#9945FF]/20 text-[#C5A6FF]'
          : 'text-[#8B8B9E] hover:bg-[#1F1F2E] hover:text-foreground'
      )}
    >
      {icon}
    </button>
  )
}
