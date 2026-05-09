import { useEffect, useRef, useState } from 'react'
import {
  Pencil,
  Undo2,
  Redo2,
  History,
  Share2,
  Download,
  Settings,
  Sparkles,
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

  useEffect(() => {
    if (editingName) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editingName])

  const handleShare = async () => {
    const { nodes, edges } = useFlowStore.getState()
    const viewport = getViewport()
    const url = buildShareUrl({ nodes, edges, viewport })
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

        {/* Right — action buttons + Ask AI */}
        <div className="flex items-center gap-1">
          <GhostBtn icon={<Undo2 className="h-3.5 w-3.5" />} title="Undo" />
          <GhostBtn icon={<Redo2 className="h-3.5 w-3.5" />} title="Redo" />
          <GhostBtn icon={<History className="h-3.5 w-3.5" />} title="History" />
          <GhostBtn
            icon={<Share2 className="h-3.5 w-3.5" />}
            title="Share"
            onClick={handleShare}
          />
          <GhostBtn icon={<Download className="h-3.5 w-3.5" />} title="Download" />
          <GhostBtn icon={<Settings className="h-3.5 w-3.5" />} title="Settings" />
          <div className="mx-2 h-5 w-px bg-[#1F1F2E]" />
          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all',
              'bg-[#9945FF] text-white hover:bg-[#8438EE] shadow-[0_2px_8px_rgba(153,69,255,0.4)]'
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask AI
          </button>
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
