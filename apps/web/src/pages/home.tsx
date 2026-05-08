import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  addEdge,
  Controls,
  MiniMap,
  type Connection,
  type IsValidConnection,
  type Node,
  type Edge,
  type Viewport,
  SelectionMode,
} from '@xyflow/react'
import { nodeMap } from '@/utils/node/node-map'
import { useFlowStore } from '@/stores/flow-store'
import { readFlowFromLocation, clearFlowHash } from '@/utils/flow/share'
import { FlowToolbar } from '@/components/flow/flow-toolbar'

const textCompatibleTargetTypes = new Set(['text', 'publicKey', 'signature', 'privateKey', 'mint'])
const publicKeyCompatibleTargetTypes = new Set(['publicKey', 'mint'])
const numberCompatibleTargetTypes = new Set(['number', 'uiAmount', 'decimals'])
const uiAmountCompatibleTargetTypes = new Set(['uiAmount', 'number'])
const decimalsCompatibleTargetTypes = new Set(['decimals', 'number'])
const walletCompatibleTargetTypes = new Set(['wallet', 'privateKey'])

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
  if (srcType === 'wallet' && walletCompatibleTargetTypes.has(tgtType)) return true
  return false
}

export default function Home() {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const viewport = useFlowStore((s) => s.viewport)
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)
  const setNodes = useFlowStore((s) => s.setNodes)
  const setEdges = useFlowStore((s) => s.setEdges)
  const setViewport = useFlowStore((s) => s.setViewport)
  const replaceFlow = useFlowStore((s) => s.replaceFlow)

  useEffect(() => {
    const shared = readFlowFromLocation()
    if (shared) {
      replaceFlow(shared)
      clearFlowHash()
    }
  }, [replaceFlow])

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

  const onPaneClick = useCallback(() => {
    window.dispatchEvent(new Event('flow-pane-click'))
  }, [])

  const onViewportChange = useCallback((vp: Viewport) => setViewport(vp), [setViewport])

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
    <div style={{ width: '100vw', height: 'calc(100vh - 74px)' }}>
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
        onPaneClick={onPaneClick}
        onViewportChange={onViewportChange}
        isValidConnection={isValidConnection}
        defaultViewport={viewport}
        fitView={!viewport}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Full}
        panOnDrag={false}
        className="bg-teal-50"
      >
        <MiniMap />
        <Controls />
        <FlowToolbar />
      </ReactFlow>
    </div>
  )
}
