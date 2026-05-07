import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'
import { nodeConfigRegistry } from '@/utils/node/node-config-registry'
import { NodeTypeEnum, type NodeType } from '@/types/node'
import { generateNodeId } from '@/utils/crypto/crypto.utils'
import type { FlowResponse } from './tools'

const NODE_WIDTH = 200
const NODE_H_STEP = 340
const NODE_V_PADDING = 40
const HANDLE_PX = 16
const NODE_CHROME = 70  // label bar + top/bottom padding

const isValidNodeType = (type: string): type is NodeType =>
  Object.values(NodeTypeEnum).includes(type as NodeTypeEnum)

const estimateNodeHeight = (type: NodeType): number => {
  const config = nodeConfigRegistry[type]
  const leftCount =
    config.handles.filter((h) => h.position === Position.Left).length +
    (config.actions ?? []).filter((a) => a.position === Position.Left).length
  const rightCount =
    config.handles.filter((h) => h.position === Position.Right).length +
    (config.actions ?? []).filter((a) => a.position === Position.Right).length
  return Math.max(leftCount, rightCount, 1) * HANDLE_PX + NODE_CHROME
}

const getHandlePosition = (nodeType: NodeType, field: string, handleType: 'source' | 'target'): Position | null => {
  const config = nodeConfigRegistry[nodeType]
  const handle = config.handles.find((h) => h.dataField === field && h.type === handleType)
  return handle ? (handle.position as Position) : null
}

const layoutNodes = (
  aiNodes: FlowResponse['nodes'],
  aiEdges: FlowResponse['edges']
): Record<string, { x: number; y: number }> => {
  const layers: Record<string, number> = {}
  const inDegree: Record<string, number> = {}

  aiNodes.forEach((n) => (inDegree[n.id] = 0))
  aiEdges.forEach((e) => {
    inDegree[e.to] = (inDegree[e.to] ?? 0) + 1
  })

  const queue = aiNodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id)
  queue.forEach((id) => (layers[id] = 0))

  while (queue.length) {
    const current = queue.shift()!
    aiEdges
      .filter((e) => e.from === current)
      .forEach((e) => {
        layers[e.to] = Math.max(layers[e.to] ?? 0, (layers[current] ?? 0) + 1)
        inDegree[e.to]--
        if (inDegree[e.to] === 0) queue.push(e.to)
      })
  }

  const byLayer: Record<number, string[]> = {}
  Object.entries(layers).forEach(([id, layer]) => {
    byLayer[layer] = byLayer[layer] ?? []
    byLayer[layer].push(id)
  })

  const positions: Record<string, { x: number; y: number }> = {}

  Object.entries(byLayer).forEach(([layer, ids]) => {
    const x = Number(layer) * (NODE_WIDTH + NODE_H_STEP)

    const heights = ids.map((id) => {
      const type = aiNodes.find((n) => n.id === id)?.type
      return isValidNodeType(type ?? '') ? estimateNodeHeight(type as NodeType) : 100
    })

    const totalH = heights.reduce((sum, h) => sum + h, 0) + (ids.length - 1) * NODE_V_PADDING
    let y = -totalH / 2

    ids.forEach((id, i) => {
      positions[id] = { x, y }
      y += heights[i] + NODE_V_PADDING
    })
  })

  return positions
}

export type ApplyFlowResult = { nodes: Node[]; edges: Edge[] }

export const buildFlowFromAiResponse = (
  response: FlowResponse,
  canvasOffset: { x: number; y: number } = { x: 200, y: 300 }
): ApplyFlowResult => {
  const validAiNodes = response.nodes.filter((n) => isValidNodeType(n.type))
  response.unknownTypes = response.nodes
    .filter((n) => !isValidNodeType(n.type))
    .map((n) => n.type)
  const validIds = new Set(validAiNodes.map((n) => n.id))

  const validAiEdges = response.edges.filter((e) => validIds.has(e.from) && validIds.has(e.to))

  const positions = layoutNodes(validAiNodes, validAiEdges)

  const idMap: Record<string, string> = {}
  validAiNodes.forEach((n) => (idMap[n.id] = generateNodeId()))

  const nodes: Node[] = validAiNodes.map((aiNode) => ({
    id: idMap[aiNode.id],
    type: aiNode.type as NodeType,
    position: {
      x: canvasOffset.x + (positions[aiNode.id]?.x ?? 0),
      y: canvasOffset.y + (positions[aiNode.id]?.y ?? 0),
    },
    data: aiNode.data ?? {},
  }))

  const edges: Edge[] = []

  for (const aiEdge of validAiEdges) {
    const fromType = validAiNodes.find((n) => n.id === aiEdge.from)?.type as NodeType
    const toType = validAiNodes.find((n) => n.id === aiEdge.to)?.type as NodeType
    if (!fromType || !toType) continue

    const srcPos = getHandlePosition(fromType, aiEdge.fromHandle, 'source')
    const tgtPos = getHandlePosition(toType, aiEdge.toHandle, 'target')
    if (!srcPos || !tgtPos) continue

    const sourceId = idMap[aiEdge.from]
    const targetId = idMap[aiEdge.to]
    const sourceHandle = `${sourceId}-${aiEdge.fromHandle}-${srcPos}`
    const targetHandle = `${targetId}-${aiEdge.toHandle}-${tgtPos}`

    edges.push({
      id: `edge-${sourceHandle}-${targetHandle}`,
      source: sourceId,
      sourceHandle,
      target: targetId,
      targetHandle,
    })
  }

  return { nodes, edges }
}
