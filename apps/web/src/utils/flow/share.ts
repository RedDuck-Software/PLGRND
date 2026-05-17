import LZString from 'lz-string'
import type { FlowSnapshot } from '@/stores/flow-store'
import { FLOW_STORAGE_VERSION, sanitizeNodes } from '@/stores/flow-store'

export const FLOW_HASH_KEY = 'flow'
const VIEW_PARAM_KEY = 'view'

const parseLocationParams = (): URLSearchParams => {
  const merged = new URLSearchParams()
  if (typeof window === 'undefined') return merged
  const search = new URLSearchParams(window.location.search)
  for (const [k, v] of search.entries()) merged.set(k, v)
  const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  if (rawHash) {
    const normalizedHash = rawHash.replace(/\?/g, '&')
    const hashParams = new URLSearchParams(normalizedHash)
    for (const [k, v] of hashParams.entries()) {
      if (k === FLOW_HASH_KEY) continue
      if (!merged.has(k)) merged.set(k, v)
    }
  }
  return merged
}

export const isViewModeFromLocation = (): boolean => {
  return parseLocationParams().get(VIEW_PARAM_KEY) === 'true'
}

interface SerializedFlow {
  v: number
  nodes: FlowSnapshot['nodes']
  edges: FlowSnapshot['edges']
  viewport?: FlowSnapshot['viewport']
}

export const encodeFlowToHash = (snapshot: FlowSnapshot): string => {
  const payload: SerializedFlow = {
    v: FLOW_STORAGE_VERSION,
    nodes: sanitizeNodes(snapshot.nodes),
    edges: snapshot.edges,
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
    return { nodes: sanitizeNodes(parsed.nodes), edges: parsed.edges, viewport: parsed.viewport }
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
  const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const normalizedHash = rawHash.replace(/\?/g, '&')
  const hashParams = new URLSearchParams(normalizedHash)
  if (!hashParams.has(FLOW_HASH_KEY)) return
  hashParams.delete(FLOW_HASH_KEY)
  const searchParams = new URLSearchParams(window.location.search)
  for (const [k, v] of Array.from(hashParams.entries())) {
    if (!searchParams.has(k)) searchParams.set(k, v)
    hashParams.delete(k)
  }
  const remainingHash = hashParams.toString()
  const newHash = remainingHash ? `#${remainingHash}` : ''
  const newSearch = searchParams.toString()
  const newQuery = newSearch ? `?${newSearch}` : ''
  const newUrl = `${window.location.pathname}${newQuery}${newHash}`
  window.history.replaceState(null, '', newUrl)
}
