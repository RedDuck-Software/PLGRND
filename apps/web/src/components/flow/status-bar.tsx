import { useMemo } from 'react'
import { Crosshair, Undo2, Unlink } from 'lucide-react'
import { useFlowStore } from '@/stores/flow-store'
import { useUIStore } from '@/stores/ui-store'
import { getNodeConfig } from '@/utils/node/node-config-registry'
import type { NodeType } from '@/types/node'

export function StatusBar() {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const past = useFlowStore((s) => s.past)
  const cursorPosition = useUIStore((s) => s.cursorPosition)

  const selectedNodes = useMemo(() => nodes.filter((n) => (n as { selected?: boolean }).selected), [nodes])
  const selectedCount = selectedNodes.length
  const singleSelected = selectedCount === 1 ? selectedNodes[0] : null
  const singleConfig = useMemo(
    () => (singleSelected ? getNodeConfig(singleSelected.type as NodeType) : null),
    [singleSelected]
  )

  const isolatedCount = useMemo(() => {
    const connectedIds = new Set(edges.flatMap((e) => [e.source, e.target]))
    return nodes.filter((n) => n.type !== 'COMMENT' && !connectedIds.has(n.id)).length
  }, [nodes, edges])

  return (
    <footer className="flex h-9 shrink-0 items-center justify-between border-t border-[#1F1F2E] bg-background px-4 text-[10px] font-mono">
      {/* Left — cursor position */}
      <div className="flex items-center gap-1 text-[#8B8B9E] w-40">
        <Crosshair className="h-3 w-3 shrink-0" />
        {cursorPosition ? (
          <span className="tabular-nums">
            <span className="text-foreground">{cursorPosition.x}</span>
            <span className="text-[#3A3A4D]">, </span>
            <span className="text-foreground">{cursorPosition.y}</span>
          </span>
        ) : (
          <span>—</span>
        )}
      </div>

      {/* Center — selection */}
      <div className="flex items-center gap-1.5 text-[#8B8B9E]">
        {selectedCount === 0 && <span>no selection</span>}
        {selectedCount === 1 && singleConfig && (
          <>
            <span className="font-semibold text-foreground">
              {singleConfig.label.toLowerCase().replace(/_/g, ' ')}
            </span>
            <span className="text-[#3A3A4D]">·</span>
            <span>{singleSelected!.id}</span>
          </>
        )}
        {selectedCount > 1 && (
          <span>
            <span className="text-foreground">{selectedCount}</span> nodes selected
          </span>
        )}
      </div>

      {/* Right — undo depth + isolated nodes */}
      <div className="flex items-center gap-2.5 text-[#8B8B9E] w-40 justify-end">
        <div className="flex items-center gap-1">
          <Undo2 className="h-3 w-3" />
          <span><span className="tabular-nums text-foreground">{past.length}</span> undos</span>
        </div>
        {isolatedCount > 0 && (
          <>
            <div className="h-3 w-px bg-[#1F1F2E]" />
            <div className="flex items-center gap-1 text-[#FFB849]">
              <Unlink className="h-3 w-3" />
              <span className="tabular-nums">{isolatedCount} isolated</span>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
