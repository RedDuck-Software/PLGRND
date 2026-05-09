import { useEffect, useState } from 'react'
import { GitBranch, Sparkles, X } from 'lucide-react'
import { useFlowStore } from '@/stores/flow-store'

export function CanvasOverlays() {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const [toast, setToast] = useState<string | null>(null)

  // Show transient toast when an action happens (mock for now)
  useEffect(() => {
    if (nodes.length === 0) return
    setToast('Auto-arranged')
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [nodes.length])

  if (nodes.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Top-left: nodes/wires count pill */}
      <div
        className="pointer-events-auto absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0E0E1A]/85 px-2.5 py-1"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <GitBranch className="h-3 w-3 text-[#14F195]" />
        <span className="font-mono text-[10px] text-[#C8C8DC]">
          <span className="tabular-nums">{nodes.length}</span> nodes ·{' '}
          <span className="tabular-nums">{edges.length}</span> wires
        </span>
      </div>

      {/* Top-left, right of count: toast */}
      {toast && (
        <div
          className="pointer-events-auto absolute top-3 left-[185px] flex items-center gap-1.5 rounded-full border border-[#14F195]/40 bg-[#14F195]/10 px-2.5 py-1"
          style={{ backdropFilter: 'blur(8px)', animation: 'fadeIn 200ms ease-out' }}
        >
          <Sparkles className="h-3 w-3 text-[#14F195]" />
          <span className="font-mono text-[10px] font-semibold text-[#14F195] tracking-wide">
            {toast}
          </span>
          <span className="text-[10px] text-[#3A3A4D]">·</span>
          <span className="text-[10px] text-[#8B8B9E]">just now</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 text-[#5A5A6E] hover:text-[#C8C8DC] transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  )
}
