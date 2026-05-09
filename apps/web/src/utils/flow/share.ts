import LZString from 'lz-string'
import type { FlowSnapshot } from '@/stores/flow-store'
import { FLOW_STORAGE_VERSION, sanitizeNodes, sanitizeVariables } from '@/stores/flow-store'

export const FLOW_HASH_KEY = 'flow'

interface SerializedFlow {
  v: number
  nodes: FlowSnapshot['nodes']
  edges: FlowSnapshot['edges']
  variables?: FlowSnapshot['variables']
  viewport?: FlowSnapshot['viewport']
}

export const encodeFlowToHash = (snapshot: FlowSnapshot): string => {
  const payload: SerializedFlow = {
    v: FLOW_STORAGE_VERSION,
    nodes: sanitizeNodes(snapshot.nodes),
    edges: snapshot.edges,
    variables: sanitizeVariables(snapshot.variables),
    viewport: snapshot.viewport,
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export const decodeFlowFromHash = (encoded: string): FlowSnapshot | null => {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const parsed = JSON.parse(json) as SerializedFlow
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null
    return {
      nodes: sanitizeNodes(parsed.nodes),
      edges: parsed.edges,
      variables: sanitizeVariables(parsed.variables),
      viewport: parsed.viewport,
    }
  } catch {
    return null
  }
}

const extractFlowFromHashString = (hashString: string): FlowSnapshot | null => {
  const hash = hashString.startsWith('#') ? hashString.slice(1) : hashString
  if (!hash) return null
  const params = new URLSearchParams(hash)
  const encoded = params.get(FLOW_HASH_KEY)
  if (!encoded) return null
  return decodeFlowFromHash(encoded)
}

export const readFlowFromLocation = (): FlowSnapshot | null => {
  if (typeof window === 'undefined') return null
  return extractFlowFromHashString(window.location.hash)
}

export const readFlowFromUrl = (url: string): FlowSnapshot | null => {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    return extractFlowFromHashString(parsed.hash)
  } catch {
    return null
  }
}

export const buildShareUrl = (snapshot: FlowSnapshot): string => {
  const encoded = encodeFlowToHash(snapshot)
  const url = new URL(window.location.href)
  url.hash = `${FLOW_HASH_KEY}=${encoded}`
  return url.toString()
}

export const clearFlowHash = () => {
  if (typeof window === 'undefined') return
  if (!window.location.hash) return
  const url = new URL(window.location.href)
  url.hash = ''
  window.history.replaceState(null, '', url.toString())
}
