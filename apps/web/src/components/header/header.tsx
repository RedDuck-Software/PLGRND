import { useEffect, useRef, useState } from 'react'
import {
  Pencil,
  Undo2,
  Redo2,
  Share2,
  Download,
  Settings,
  ChevronDown,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { useFlowStore } from '@/stores/flow-store'
import { buildShareUrl } from '@/utils/flow/share'
import { useReactFlow } from '@xyflow/react'
import { ExampleFlowsModal } from '@/components/flow/example-flows-modal'
import { cn } from '@/lib/utils'

export const Header = () => {
  const [examplesOpen, setExamplesOpen] = useState(false)
  const [projectName, setProjectName] = useState('message-signer')
  const [editingName, setEditingName] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { getViewport } = useReactFlow()
  const canUndo = useFlowStore((s) => s.past.length > 0)
  const canRedo = useFlowStore((s) => s.future.length > 0)
  const undo = useFlowStore((s) => s.undo)
  const redo = useFlowStore((s) => s.redo)

  useEffect(() => {
    if (editingName) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editingName])

  const handleShare = async () => {
    const { nodes, edges, variables } = useFlowStore.getState()
    const viewport = getViewport()
    const url = buildShareUrl({ nodes, edges, variables, viewport })
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1F1F2E] bg-background px-4 z-50 relative">
        {/* Left — logo + DEVNET badge */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo: 3 gradient bars */}
          <div className="flex flex-col gap-[2px] w-[22px]">
            <span
              className="h-1 w-full rounded-sm"
              style={{ background: 'linear-gradient(270deg, #9945FF, #14F195)' }}
            />
            <span
              className="h-1 w-full rounded-sm"
              style={{ background: 'linear-gradient(270deg, #9945FF, #14F195)' }}
            />
            <span
              className="h-1 w-full rounded-sm"
              style={{ background: 'linear-gradient(270deg, #9945FF, #14F195)' }}
            />
          </div>
          <span className="text-[18px] font-bold text-foreground tracking-tight leading-none">
            plgrnd.sol
          </span>
          <span
            className="rounded-md border border-[#9945FF]/40 bg-[#9945FF]/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.1em] text-[#C5A6FF] leading-none"
          >
            DEVNET
          </span>
        </div>

        {/* Center — project switcher + auto-save status */}
        <div className="flex items-center gap-2.5">
          {editingName ? (
            <div className="flex items-center gap-1 rounded-md border border-[#9945FF]/60 bg-[#13131D] px-2.5 py-1 ring-2 ring-[#9945FF]/20">
              <input
                ref={inputRef}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') setEditingName(false)
                }}
                onBlur={() => setEditingName(false)}
                className="bg-transparent text-[12px] font-mono text-foreground outline-none w-[160px]"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEditingName(false)}
                className="text-[#14F195] hover:text-foreground transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setExamplesOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-[#1F1F2E] bg-[#13131D] px-2.5 py-1.5 text-[12px] font-mono text-foreground hover:bg-[#1F1F2E] transition-colors"
              >
                {projectName}
                <ChevronDown className="h-3.5 w-3.5 text-[#8B8B9E]" />
              </button>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="text-[#8B8B9E] hover:text-foreground transition-colors"
                title="Rename"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <span
            className="h-2 w-2 rounded-full bg-[#14F195] shrink-0"
            style={{
              boxShadow: '0 0 8px #14F195aa',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span className="text-[12px] text-[#8B8B9E]">Auto-saved</span>
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-1">
          <GhostBtn
            icon={<Undo2 className="h-3.5 w-3.5" />}
            title="Undo"
            onClick={undo}
            disabled={!canUndo}
          />
          <GhostBtn
            icon={<Redo2 className="h-3.5 w-3.5" />}
            title="Redo"
            onClick={redo}
            disabled={!canRedo}
          />
          <GhostBtn
            icon={<Share2 className="h-3.5 w-3.5" />}
            title="Share"
            onClick={handleShare}
          />
          <GhostBtn icon={<Download className="h-3.5 w-3.5" />} title="Download" />
          <GhostBtn icon={<Settings className="h-3.5 w-3.5" />} title="Settings" />
        </div>
      </header>

      <ExampleFlowsModal open={examplesOpen} onOpenChange={setExamplesOpen} />
    </>
  )
}

function GhostBtn({
  icon,
  title,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  title: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md text-[#8B8B9E] transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:bg-[#13131D] hover:text-foreground'
      )}
    >
      {icon}
    </button>
  )
}
