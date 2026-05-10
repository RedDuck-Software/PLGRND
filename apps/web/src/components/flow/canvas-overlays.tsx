import { GitBranch } from 'lucide-react'
import { useFlowStore } from '@/stores/flow-store'

export function CanvasOverlays() {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)

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
    </div>
  )
}
