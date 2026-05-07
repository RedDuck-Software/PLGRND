import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  addEdge,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type IsValidConnection,
  type Node,
  type Edge,
  SelectionMode,
} from '@xyflow/react'
import { nodeMap } from '@/utils/node/node-map'
import { NodeTypeEnum, type NodeType } from '@/types/node'
import { AiPanel } from '@/components/ai-panel/ai-panel'
import { buildFlowFromAiResponse } from '@/utils/ai/apply-flow'
import { nodeStyles } from '@/utils/node/node-style.utils'
import type { FlowResponse } from '@/utils/ai/tools'

const initialNodes: Node[] = [
  { id: 'default1', position: { x: 0, y: 0 }, type: NodeTypeEnum.TEXT, data: { text: 'Welcome to SOL Learn!' } },
  {
    id: 'default2',
    position: { x: 0, y: 70 },
    type: NodeTypeEnum.TEXT,
    data: { text: "I hope we've made your Solana learning journey much easier!" },
  },
]
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }]

const textCompatibleTargetTypes = new Set(['text', 'publicKey', 'signature', 'privateKey', 'mint'])
const publicKeyCompatibleTargetTypes = new Set(['publicKey', 'mint'])
const numberCompatibleTargetTypes = new Set(['number', 'uiAmount', 'decimals'])
const uiAmountCompatibleTargetTypes = new Set(['uiAmount', 'number'])
const decimalsCompatibleTargetTypes = new Set(['decimals', 'number'])

const getHandleMaxConnections = (handleId?: string | null) => {
  if (!handleId) return undefined

  const handleEl = document.querySelector(`[data-id="${handleId}"]`) as HTMLElement | null
  const raw = handleEl?.getAttribute('data-max-connections')
  if (!raw) return undefined

  const maxConnections = Number(raw)
  return Number.isFinite(maxConnections) ? maxConnections : undefined
}

const canConnectToTargetHandle = (targetHandle: string | null | undefined, edges: Edge[]) => {
  const maxConnections = getHandleMaxConnections(targetHandle)
  if (maxConnections === undefined) return true

  const currentConnections = edges.filter((edge) => edge.targetHandle === targetHandle).length
  return currentConnections < maxConnections
}

const areHandleTypesCompatible = (srcType?: string | null, tgtType?: string | null) => {
  if (!tgtType) return true
  if (tgtType === 'any' || srcType === 'any') return true
  if (!srcType) return false
  if (srcType === tgtType) return true
  if (srcType === 'text' && textCompatibleTargetTypes.has(tgtType)) return true
  if (srcType === 'publicKey' && publicKeyCompatibleTargetTypes.has(tgtType)) return true
  if (srcType === 'number' && numberCompatibleTargetTypes.has(tgtType)) return true
  if (srcType === 'uiAmount' && uiAmountCompatibleTargetTypes.has(tgtType)) return true
  if (srcType === 'decimals' && decimalsCompatibleTargetTypes.has(tgtType)) return true
  return false
}

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const addFlowToCanvas = useCallback(
    (flow: FlowResponse) => {
      const offset = (() => {
        if (nodes.length === 0) return { x: 200, y: 300 }
        let maxX = 0
        let totalY = 0
        for (const n of nodes) {
          const width = nodeStyles[n.type as NodeType]?.width ?? 200
          maxX = Math.max(maxX, n.position.x + width)
          totalY += n.position.y
        }
        return { x: maxX + 80, y: totalY / nodes.length }
      })()
      const { nodes: newNodes, edges: newEdges } = buildFlowFromAiResponse(flow, offset)
      setNodes((prev) => [...prev, ...newNodes])
      setEdges((prev) => [...prev, ...newEdges])
    },
    [nodes, setNodes, setEdges]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((edgesSnapshot) => {
        if (!canConnectToTargetHandle(params.targetHandle, edgesSnapshot)) return edgesSnapshot
        return addEdge(params, edgesSnapshot)
      })
      const all = Array.from(document.querySelectorAll('[data-handle-type]')) as HTMLElement[]
      for (const el of all) el.classList.remove('handle--dim', 'handle--highlight')
      document.body.removeAttribute('data-connecting-type')
    },
    [setEdges]
  )
  const isValidConnection: IsValidConnection = useCallback(
    (edge) => {
      if (!('sourceHandle' in edge) || !('targetHandle' in edge)) return true
      const c = edge as Connection
      if (!canConnectToTargetHandle(c.targetHandle, edges)) return false

      const sourceEl = document.querySelector(`[data-id="${c.sourceHandle}"]`) as HTMLElement | null
      const targetEl = document.querySelector(`[data-id="${c.targetHandle}"]`) as HTMLElement | null
      const srcType = sourceEl?.getAttribute('data-type')
      const tgtType = targetEl?.getAttribute('data-type')
      return areHandleTypesCompatible(srcType, tgtType)
    },
    [edges]
  )
  const onConnectStart = useCallback(
    (_: unknown, params: { handleId: string | null; nodeId: string | null; handleType: string | null }) => {
      if (!params?.handleId) return
      const sourceEl = document.querySelector(`[data-id="${params.handleId}"]`) as HTMLElement | null
      const srcType = sourceEl?.getAttribute('data-type')
      const allTargets = Array.from(document.querySelectorAll('[data-handle-type="target"]')) as HTMLElement[]
      for (const el of allTargets) {
        const targetHandle = el.getAttribute('data-id')
        const tgtType = el.getAttribute('data-type')
        const hasAvailableSlot = canConnectToTargetHandle(targetHandle, edges)
        const isCompatible = areHandleTypesCompatible(srcType, tgtType)

        if (hasAvailableSlot && isCompatible) {
          el.classList.remove('handle--dim')
        } else {
          el.classList.add('handle--dim')
          el.classList.remove('handle--highlight')
        }
      }
    },
    [edges]
  )
  const onConnectEnd = useCallback(() => {
    const all = Array.from(document.querySelectorAll('[data-handle-type]')) as HTMLElement[]
    for (const el of all) el.classList.remove('handle--dim', 'handle--highlight')
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && e.target === document.body) {
        const selectedNodes = nodes.filter((node) => (node as Node).selected)
        if (selectedNodes.length > 0) {
          setNodes((nds) => nds.filter((node) => !(node as Node).selected))
          setEdges((eds) =>
            eds.filter((edge) => !selectedNodes.some((node) => node.id === edge.source || node.id === edge.target))
          )
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nodes, setNodes, setEdges])

  return (
    <div style={{ height: 'calc(100vh - 74px)' }} className="flex">
      <div className="flex-1 relative">
      <ReactFlow
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeMap}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        fitView
        selectionOnDrag={true}
        selectionMode={SelectionMode.Full}
        panOnDrag={false}
        className="bg-teal-50"
      >
        <MiniMap />
        <Controls />
      </ReactFlow>
      </div>
      <AiPanel onApplyFlow={addFlowToCanvas} />
    </div>
  )
}
