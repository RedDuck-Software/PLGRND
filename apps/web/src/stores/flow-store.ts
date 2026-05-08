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

export const FLOW_STORAGE_KEY = 'sol-learn:flow'
export const FLOW_STORAGE_VERSION = 3

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

const defaultNodes: Node[] = []
const defaultEdges: Edge[] = []

export interface FlowSnapshot {
  nodes: Node[]
  edges: Edge[]
  viewport?: Viewport
}

interface FlowState extends FlowSnapshot {
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void
  setViewport: (viewport: Viewport) => void
  replaceFlow: (snapshot: FlowSnapshot) => void
  resetFlow: () => void
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      nodes: defaultNodes,
      edges: defaultEdges,
      viewport: undefined,
      onNodesChange: (changes) => set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),
      onEdgesChange: (changes) => set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),
      setNodes: (updater) =>
        set((s) => ({ nodes: typeof updater === 'function' ? (updater as (n: Node[]) => Node[])(s.nodes) : updater })),
      setEdges: (updater) =>
        set((s) => ({ edges: typeof updater === 'function' ? (updater as (e: Edge[]) => Edge[])(s.edges) : updater })),
      setViewport: (viewport) => set({ viewport }),
      replaceFlow: (snapshot) =>
        set({ nodes: snapshot.nodes, edges: snapshot.edges, viewport: snapshot.viewport }),
      resetFlow: () => set({ nodes: defaultNodes, edges: defaultEdges, viewport: undefined }),
    }),
    {
      name: FLOW_STORAGE_KEY,
      version: FLOW_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: sanitizeNodes(state.nodes),
        edges: state.edges,
        viewport: state.viewport,
      }),
      migrate: (persisted, _version) => {
        const p = persisted as Partial<FlowSnapshot> | undefined
        if (!p) return p
        return {
          ...p,
          nodes: Array.isArray(p.nodes) ? sanitizeNodes(p.nodes as Node[]) : [],
        }
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<FlowSnapshot> | undefined
        if (!p) return current
        return {
          ...current,
          ...p,
          nodes: Array.isArray(p.nodes) ? sanitizeNodes(p.nodes as Node[]) : current.nodes,
        }
      },
    }
  )
)
