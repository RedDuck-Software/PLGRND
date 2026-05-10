import { useEffect, useRef, useState } from 'react'
import {
  Pencil,
  Undo2,
  Redo2,
  Share2,
  Download,
  Upload,
  ChevronDown,
  Check,
  FolderOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { useFlowStore, sanitizeNodes, sanitizeVariables, FLOW_STORAGE_VERSION } from '@/stores/flow-store'
import { buildShareUrl } from '@/utils/flow/share'
import { useReactFlow } from '@xyflow/react'
import { ExampleFlowsModal } from '@/components/flow/example-flows-modal'
import { cn } from '@/lib/utils'

export const Header = () => {
  const [examplesOpen, setExamplesOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const projectName = useFlowStore((s) => s.projectName)
  const setProjectName = useFlowStore((s) => s.setProjectName)
  const [fileMenuOpen, setFileMenuOpen] = useState(false)
  const fileMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { getViewport, setViewport } = useReactFlow()
  const canUndo = useFlowStore((s) => s.past.length > 0)
  const canRedo = useFlowStore((s) => s.future.length > 0)
  const undo = useFlowStore((s) => s.undo)
  const redo = useFlowStore((s) => s.redo)
  const replaceFlow = useFlowStore((s) => s.replaceFlow)

  useEffect(() => {
    if (editingName) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editingName])

  useEffect(() => {
    if (!fileMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setFileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [fileMenuOpen])

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

  const handleDownload = () => {
    setFileMenuOpen(false)
    const { nodes, edges, variables } = useFlowStore.getState()
    const viewport = getViewport()
    const payload = {
      v: FLOW_STORAGE_VERSION,
      nodes: sanitizeNodes(nodes),
      edges,
      variables: sanitizeVariables(variables),
      viewport,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUploadClick = () => {
    setFileMenuOpen(false)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          toast.error('Invalid flow file')
          return
        }
        const snapshot = {
          nodes: sanitizeNodes(parsed.nodes),
          edges: parsed.edges,
          variables: sanitizeVariables(parsed.variables),
          viewport: parsed.viewport,
          projectName: typeof parsed.projectName === 'string' ? parsed.projectName : undefined,
        }
        replaceFlow(snapshot)
        if (parsed.viewport) setViewport(parsed.viewport)
        toast.success('Flow loaded')
      } catch {
        toast.error('Failed to read file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1F1F2E] bg-background px-4 z-50 relative">
        {/* Left — logo */}
        <div className="flex items-center gap-3 min-w-0">
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
                className="flex items-center gap-1.5 rounded-md border border-[#1F1F2E] bg-[#13131D] px-2.5 py-1.5 text-[12px] font-mono hover:bg-[#1F1F2E] transition-colors"
              >
                <span className={projectName === 'Untitled flow' ? 'text-[#8B8B9E]' : 'text-foreground'}>
                  {projectName === 'Untitled flow' ? 'Select template' : projectName}
                </span>
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
          <span className="text-[12px] text-[#8B8B9E]">Local save</span>
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

          {/* File menu */}
          <div ref={fileMenuRef} className="relative">
            <GhostBtn
              icon={<FolderOpen className="h-3.5 w-3.5" />}
              title="File"
              onClick={() => setFileMenuOpen((v) => !v)}
              active={fileMenuOpen}
            />
            {fileMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 rounded-lg border border-[#1F1F2E] bg-[#13131D] shadow-xl overflow-hidden z-50">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-[#C8C8DC] hover:bg-[#1F1F2E] transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-[#8B8B9E]" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-[#C8C8DC] hover:bg-[#1F1F2E] transition-colors"
                >
                  <Upload className="h-3.5 w-3.5 text-[#8B8B9E]" />
                  Upload
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <ExampleFlowsModal open={examplesOpen} onOpenChange={setExamplesOpen} />
    </>
  )
}

function GhostBtn({
  icon,
  title,
  onClick,
  disabled,
  active,
}: {
  icon: React.ReactNode
  title: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-40 text-[#8B8B9E]'
          : active
            ? 'bg-[#13131D] text-foreground'
            : 'text-[#8B8B9E] hover:bg-[#13131D] hover:text-foreground'
      )}
    >
      {icon}
    </button>
  )
}
