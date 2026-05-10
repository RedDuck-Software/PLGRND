import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Viewport,
} from '@xyflow/react'
import type { FlowVariable } from '@/types/flow-variable'
import { normalizeVariableName } from '@/utils/flow/variables'

export const FLOW_STORAGE_KEY = 'sol-learn:flow'
export const FLOW_STORAGE_VERSION = 4

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

const looksLikeSerializedTransaction = (value: Record<string, unknown>): boolean =>
  Array.isArray(value.instructions) && Array.isArray(value.signatures)

const looksLikeSerializedBuffer = (value: Record<string, unknown>): boolean =>
  value.type === 'Buffer' && Array.isArray(value.data)

const sanitizeForPersist = (value: unknown): unknown => {
  if (value === null || value === undefined) return value
  const t = typeof value
  if (t === 'string' || t === 'number' || t === 'boolean') return value
  if (Array.isArray(value)) {
    const out: unknown[] = []
    for (const item of value) {
      const cleaned = sanitizeForPersist(item)
      if (cleaned !== undefined) out.push(cleaned)
    }
    return out
  }
  if (isPlainObject(value)) {
    // Drop plain objects that are residue from previously-serialized class instances
    // (Transaction, Buffer, etc). Their methods are gone and they crash any consumer
    // that expects the real type.
    if (looksLikeSerializedTransaction(value)) return undefined
    if (looksLikeSerializedBuffer(value)) return undefined
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const cleaned = sanitizeForPersist(v)
      if (cleaned !== undefined) out[k] = cleaned
    }
    return out
  }
  // Class instances (Transaction, PublicKey, Buffer, Keypair, BN, ...) get dropped.
  // Derived fields are recomputed by the corresponding node hooks on rehydration.
  return undefined
}

export const sanitizeNodes = (nodes: Node[]): Node[] =>
  nodes.map((node) => ({
    ...node,
    data: (sanitizeForPersist(node.data) as Node['data']) ?? {},
  }))

export const sanitizeVariables = (variables: unknown): FlowVariable[] => {
  if (!Array.isArray(variables)) return []

  return variables
    .map((variable) => {
      if (!isPlainObject(variable)) return null
      const name = normalizeVariableName(String(variable.name ?? ''))
      if (!name) return null
      return {
        id: String(variable.id ?? crypto.randomUUID()),
        name,
        value: String(variable.value ?? ''),
      }
    })
    .filter((variable): variable is FlowVariable => Boolean(variable))
}

const defaultNodes: Node[] = []
const defaultEdges: Edge[] = []
const defaultVariables: FlowVariable[] = []
const HISTORY_LIMIT = 50

let historyBatchQueued = false

const queueHistoryBatchReset = () => {
  if (historyBatchQueued) return
  historyBatchQueued = true
  queueMicrotask(() => {
    historyBatchQueued = false
  })
}

export interface FlowSnapshot {
  nodes: Node[]
  edges: Edge[]
  variables?: FlowVariable[]
  viewport?: Viewport
  projectName?: string
}

interface FlowHistorySnapshot {
  nodes: Node[]
  edges: Edge[]
}

interface FlowState extends FlowSnapshot {
  variables: FlowVariable[]
  projectName: string
  fitViewTrigger: number
  past: FlowHistorySnapshot[]
  future: FlowHistorySnapshot[]
  positionHistoryInProgress: boolean
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void
  setViewport: (viewport: Viewport) => void
  setProjectName: (name: string) => void
  replaceFlow: (snapshot: FlowSnapshot, options?: { recordHistory?: boolean }) => void
  resetFlow: () => void
  undo: () => void
  redo: () => void
  addVariable: () => void
  updateVariable: (id: string, patch: Partial<Omit<FlowVariable, 'id'>>) => void
  deleteVariable: (id: string) => void
}

const createVariableId = () => crypto.randomUUID()

const getNextVariableName = (variables: FlowVariable[]) => {
  const names = new Set(variables.map((variable) => variable.name))
  let index = variables.length + 1
  let name = `VARIABLE_${index}`

  while (names.has(name)) {
    index += 1
    name = `VARIABLE_${index}`
  }

  return name
}

const createHistorySnapshot = (state: FlowSnapshot): FlowHistorySnapshot => ({
  nodes: state.nodes,
  edges: state.edges,
})

const applyHistorySnapshot = (
  snapshot: FlowHistorySnapshot,
  current: FlowHistorySnapshot
): FlowHistorySnapshot => {
  const currentNodesById = new Map(current.nodes.map((node) => [node.id, node]))

  return {
    nodes: snapshot.nodes.map((node) => {
      const currentNode = currentNodesById.get(node.id)
      return currentNode ? { ...node, data: currentNode.data } : node
    }),
    edges: snapshot.edges,
  }
}

const pushHistory = (state: FlowState) => {
  if (historyBatchQueued) return {}
  queueHistoryBatchReset()
  return {
    past: [...state.past, createHistorySnapshot(state)].slice(-HISTORY_LIMIT),
    future: [],
  }
}

const hasGraphChanged = (
  state: FlowSnapshot,
  snapshot: Pick<FlowSnapshot, 'nodes' | 'edges'>
) => state.nodes !== snapshot.nodes || state.edges !== snapshot.edges

const stripNodeData = (node: Node) => {
  const nodeWithoutData = { ...node } as Partial<Node>
  delete nodeWithoutData.data
  return nodeWithoutData
}

const isDataOnlyNodeReplace = (change: NodeChange, nodes: Node[]) => {
  if (change.type !== 'replace') return false
  const previous = nodes.find((node) => node.id === change.id)
  if (!previous) return false
  return JSON.stringify(stripNodeData(previous)) === JSON.stringify(stripNodeData(change.item))
}

const shouldRecordNodeChanges = (changes: NodeChange[], state: FlowState) =>
  changes.some((change) => {
    if (change.type === 'select' || change.type === 'dimensions') return false
    if (isDataOnlyNodeReplace(change, state.nodes)) return false
    if (change.type === 'position') return !state.positionHistoryInProgress
    return true
  })

const getPositionHistoryInProgress = (changes: NodeChange[], current: boolean) => {
  if (!changes.some((change) => change.type === 'position')) return current
  return changes.some((change) => change.type === 'position' && change.dragging)
}

const shouldRecordEdgeChanges = (changes: EdgeChange[]) =>
  changes.some((change) => change.type !== 'select')

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      nodes: defaultNodes,
      edges: defaultEdges,
      variables: defaultVariables,
      viewport: undefined,
      projectName: 'Untitled flow',
      fitViewTrigger: 0,
      past: [],
      future: [],
      positionHistoryInProgress: false,
      onNodesChange: (changes) =>
        set((s) => {
          const nodes = applyNodeChanges(changes, s.nodes)
          const recordHistory = shouldRecordNodeChanges(changes, s) && nodes !== s.nodes
          return {
            nodes,
            positionHistoryInProgress: getPositionHistoryInProgress(changes, s.positionHistoryInProgress),
            ...(recordHistory ? pushHistory(s) : {}),
          }
        }),
      onEdgesChange: (changes) =>
        set((s) => {
          const edges = applyEdgeChanges(changes, s.edges)
          const recordHistory = shouldRecordEdgeChanges(changes) && edges !== s.edges
          return {
            edges,
            ...(recordHistory ? pushHistory(s) : {}),
          }
        }),
      setNodes: (updater) =>
        set((s) => {
          const nodes = typeof updater === 'function' ? (updater as (n: Node[]) => Node[])(s.nodes) : updater
          return {
            nodes,
            ...(nodes !== s.nodes ? pushHistory(s) : {}),
          }
        }),
      setEdges: (updater) =>
        set((s) => {
          const edges = typeof updater === 'function' ? (updater as (e: Edge[]) => Edge[])(s.edges) : updater
          return {
            edges,
            ...(edges !== s.edges ? pushHistory(s) : {}),
          }
        }),
      setViewport: (viewport) => set({ viewport }),
      setProjectName: (name) => set({ projectName: name }),
      replaceFlow: (snapshot, options) =>
        set((s) => {
          const next = { nodes: snapshot.nodes, edges: snapshot.edges }
          const recordHistory = options?.recordHistory !== false && hasGraphChanged(s, next)
          return {
            ...next,
            variables: sanitizeVariables(snapshot.variables),
            viewport: snapshot.viewport,
            projectName: snapshot.projectName ?? s.projectName,
            fitViewTrigger: s.fitViewTrigger + 1,
            positionHistoryInProgress: false,
            ...(recordHistory ? pushHistory(s) : { future: [] }),
          }
        }),
      resetFlow: () =>
        set((s) => {
          const next = { nodes: defaultNodes, edges: defaultEdges }
          return {
            ...next,
            variables: defaultVariables,
            viewport: undefined,
            projectName: 'Untitled flow',
            positionHistoryInProgress: false,
            ...(hasGraphChanged(s, next) ? pushHistory(s) : {}),
          }
        }),
      undo: () =>
        set((s) => {
          const previous = s.past.at(-1)
          if (!previous) return {}
          const restored = applyHistorySnapshot(previous, s)
          return {
            nodes: restored.nodes,
            edges: restored.edges,
            past: s.past.slice(0, -1),
            future: [createHistorySnapshot(s), ...s.future].slice(0, HISTORY_LIMIT),
            positionHistoryInProgress: false,
          }
        }),
      redo: () =>
        set((s) => {
          const next = s.future[0]
          if (!next) return {}
          const restored = applyHistorySnapshot(next, s)
          return {
            nodes: restored.nodes,
            edges: restored.edges,
            past: [...s.past, createHistorySnapshot(s)].slice(-HISTORY_LIMIT),
            future: s.future.slice(1),
            positionHistoryInProgress: false,
          }
        }),
      addVariable: () =>
        set((s) => ({
          variables: [
            ...s.variables,
            {
              id: createVariableId(),
              name: getNextVariableName(s.variables),
              value: '',
            },
          ],
        })),
      updateVariable: (id, patch) =>
        set((s) => ({
          variables: s.variables.map((variable) =>
            variable.id === id
              ? {
                  ...variable,
                  ...patch,
                  name: patch.name === undefined ? variable.name : normalizeVariableName(patch.name),
                }
              : variable
          ),
        })),
      deleteVariable: (id) =>
        set((s) => ({
          variables: s.variables.filter((variable) => variable.id !== id),
        })),
    }),
    {
      name: FLOW_STORAGE_KEY,
      version: FLOW_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: sanitizeNodes(state.nodes),
        edges: state.edges,
        variables: sanitizeVariables(state.variables),
        viewport: state.viewport,
        projectName: state.projectName,
      }),
      migrate: (persisted) => {
        const p = persisted as Partial<FlowSnapshot> | undefined
        if (!p) return p
        return {
          ...p,
          nodes: Array.isArray(p.nodes) ? sanitizeNodes(p.nodes as Node[]) : [],
          variables: sanitizeVariables(p.variables),
        }
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<FlowSnapshot> | undefined
        if (!p) return current
        return {
          ...current,
          ...p,
          nodes: Array.isArray(p.nodes) ? sanitizeNodes(p.nodes as Node[]) : current.nodes,
          variables: Array.isArray(p.variables) ? sanitizeVariables(p.variables) : current.variables,
        }
      },
    }
  )
)
