import { useState } from 'react'
import {
  Maximize,
  MousePointer2,
  Hand,
  GitBranch,
  Bug,
  Play,
  Square,
  Share2,
  LayoutGrid,
  Eye,
  Plus,
  Minus,
  ChevronRight,
} from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { toast } from 'sonner'
import { useFlowStore } from '@/stores/flow-store'
import { buildShareUrl } from '@/utils/flow/share'
import { cn } from '@/lib/utils'

type Tool = 'select' | 'pan' | 'connect'
type RunStatus = 'idle' | 'running'

export function CanvasToolbar() {
  const [tool, setTool] = useState<Tool>('select')
  const [status, setStatus] = useState<RunStatus>('idle')
  const [zoom, setZoom] = useState(100)
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow()

  const handleZoomIn = () => {
    zoomIn()
    setTimeout(() => setZoom(Math.round(getZoom() * 100)), 50)
  }
  const handleZoomOut = () => {
    zoomOut()
    setTimeout(() => setZoom(Math.round(getZoom() * 100)), 50)
  }
  const handleFit = () => fitView({ duration: 200 })

  const handleShare = async () => {
    const { nodes, edges } = useFlowStore.getState()
    const url = buildShareUrl({ nodes, edges, viewport: undefined })
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const toggleRun = () => {
    setStatus((s) => (s === 'idle' ? 'running' : 'idle'))
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
            {zoom}%
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

      {/* Right — debug + run + share + layout + view */}
      <div className="flex items-center gap-1">
        <ToolBtn icon={<Bug className="h-3.5 w-3.5" />} title="Debug" />
        <button
          type="button"
          onClick={toggleRun}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all',
            status === 'running'
              ? 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/40 hover:bg-[#F43F5E]/25'
              : 'bg-[#14F195]/15 text-[#14F195] border border-[#14F195]/40 hover:bg-[#14F195]/25'
          )}
        >
          {status === 'running' ? (
            <>
              <Square className="h-3 w-3 fill-current" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" />
              Run
            </>
          )}
        </button>
        <div className="mx-1 h-4 w-px bg-[#1F1F2E]" />
        <ToolBtn
          icon={<Share2 className="h-3.5 w-3.5" />}
          title="Share"
          onClick={handleShare}
        />
        <ToolBtn icon={<LayoutGrid className="h-3.5 w-3.5" />} title="Auto layout" />
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
