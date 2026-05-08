import { useState, useCallback, useEffect, useRef } from 'react'
import { useReactFlow, type XYPosition } from '@xyflow/react'
import { Library, Search, ChevronDown, ChevronRight, PanelLeftClose } from 'lucide-react'
import { menuConfig } from '@/constants/menu-config'
import { DraggableNode } from '@/components/node-select/draggable-node'
import { generateNodeId } from '@/utils/crypto/crypto.utils'
import { getNodeConfig } from '@/utils/node/node-config-registry'
import type { NodeType } from '@/types/node'
import { cn } from '@/lib/utils'

const totalCount = menuConfig.reduce((acc, c) => acc + c.nodes.length, 0)

export function BrickLibrary() {
  const { screenToFlowPosition, setNodes } = useReactFlow()
  const [search, setSearch] = useState('')
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['input', 'math'])
  )
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleNodeDrop = useCallback(
    (nodeType: NodeType, screenPosition: XYPosition) => {
      const flow = document.querySelector('.react-flow')
      const flowRect = flow?.getBoundingClientRect()
      const isInFlow =
        flowRect &&
        screenPosition.x >= flowRect.left &&
        screenPosition.x <= flowRect.right &&
        screenPosition.y >= flowRect.top &&
        screenPosition.y <= flowRect.bottom

      if (isInFlow) {
        const position = screenToFlowPosition(screenPosition)
        setNodes((nds) =>
          nds.concat({ id: generateNodeId(), type: nodeType, position, data: {} })
        )
      }
    },
    [setNodes, screenToFlowPosition]
  )

  const toggleCategory = (id: string) => {
    if (isDragging) return
    setOpenCategories((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // "/" focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const filtered = search.trim().toLowerCase()
  const visibleCategories = menuConfig
    .map((cat) => ({
      ...cat,
      nodes: cat.nodes.filter((n) => {
        if (!filtered) return true
        const label = getNodeConfig(n).label.toLowerCase()
        return label.includes(filtered)
      }),
    }))
    .filter((cat) => cat.nodes.length > 0)

  return (
    <aside className="flex flex-col w-[280px] shrink-0 bg-[#0E0E18] border-r border-[#1F1F2E] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Library className="h-3.5 w-3.5 shrink-0 text-[#8B8B9E]" />
          <span className="text-[13px] font-semibold text-[#C8C8DC] truncate">
            Block Library
          </span>
          <span className="rounded-md border border-[#1F1F2E] bg-[#13131D] px-1.5 py-0.5 text-[10px] font-mono text-[#8B8B9E] tabular-nums leading-none">
            {totalCount}+
          </span>
        </div>
        <button
          type="button"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-[#1F1F2E] bg-[#13131D] hover:bg-[#1F1F2E] transition-colors"
          title="Collapse"
        >
          <PanelLeftClose className="h-3.5 w-3.5 text-[#C8C8DC]" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2.5">
        <div className="flex h-[34px] items-center gap-2 rounded-lg border border-[#1F1F2E] bg-[#13131D] px-2.5 focus-within:border-[#9945FF]/50 transition-colors">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#8B8B9E]" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${totalCount}+ blocks...`}
            className="w-full bg-transparent text-[12px] text-foreground placeholder:text-[#8B8B9E] outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[#8B8B9E] hover:text-foreground text-[14px] leading-none w-4"
            >
              ×
            </button>
          ) : (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded border border-[#1F1F2E] bg-[#0E0E18] px-1 text-[10px] font-mono text-[#8B8B9E]">
              /
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1F1F2E]" />

      {/* Categories */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {visibleCategories.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <p className="text-[11px] text-[#8B8B9E]">No blocks found</p>
          </div>
        ) : (
          visibleCategories.map((category) => {
            const isOpen = filtered ? true : openCategories.has(category.id)
            return (
              <div key={category.id} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between rounded-md px-1 py-2 hover:bg-[#13131D] transition-colors group"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: isOpen ? category.color : '#8B8B9E' }}
                  >
                    {category.label.toUpperCase()}
                    <span className="mx-2 text-[#3A3A4D]">·</span>
                    <span className="font-mono tabular-nums">{category.nodes.length}</span>
                  </span>
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 text-[#8B8B9E] transition-transform" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-[#8B8B9E] transition-transform" />
                  )}
                </button>

                {isOpen && (
                  <div className="pb-1 pt-0.5">
                    {category.nodes.map((nodeType) => (
                      <DraggableNode
                        key={nodeType}
                        type={nodeType}
                        onDrop={handleNodeDrop}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={() => setIsDragging(false)}
                        categoryColor={category.color}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
