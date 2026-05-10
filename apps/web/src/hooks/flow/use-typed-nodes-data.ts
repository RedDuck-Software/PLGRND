import { useMemo } from 'react'
import { useNodeConnections, useNodesData, type Node } from '@xyflow/react'
import type { NodeTypeEnum, TargetFieldsForEnum } from '@/types/node'
import { useFlowStore } from '@/stores/flow-store'
import { resolveFlowVariables } from '@/utils/flow/variables'

export type ResolvedConnection<V = unknown> = {
  sourceId?: string
  sourceHandleId?: string
  dataField?: string
  value: V
}

function parseHandleMeta(handleId: string, nodeId: string): string {
  // Convention from CustomNode: id = `${nodeId}-${dataField}-${position}`
  // Example: n3-text-left
  const rest = handleId.slice((nodeId + '-').length)
  const parts = rest.split('-')
  const dataField = parts[0]

  return dataField
}

export function useTypedNodesData<T extends TargetFieldsForEnum<NodeTypeEnum>>(id: string) {
  const connections = useNodeConnections({ handleType: 'target', id })
  const variables = useFlowStore((s) => s.variables)

  const sourceIds = useMemo(() => {
    return (connections ?? []).map((c) => c.source).filter((id): id is string => Boolean(id))
  }, [connections])

  const nodes = useNodesData<Node>(sourceIds)

  const nodesById = useMemo(() => {
    const map = new Map<string, Pick<Node, 'id' | 'type' | 'data'>>()
    for (const n of nodes) map.set(n.id, n)
    return map
  }, [nodes])

  return useMemo(() => {
    const record: Partial<Record<T, ResolvedConnection>> = {}
    for (const connection of connections) {
      if (!connection.source || !connection.target) continue
      if (!connection.sourceHandle || !connection.targetHandle) continue
      const node = nodesById.get(connection.source) ?? null
      const dataField = parseHandleMeta(connection.sourceHandle, connection.source)
      const raw = dataField && node ? node.data?.[dataField] : undefined
      const resolved = resolveFlowVariables(raw, variables)

      let value = resolved
      if (node?.type === 'NUMBER') {
        if (raw === undefined || raw === null || raw === '') {
          value = undefined
        } else {
          const num = Number(resolved)
          value = Number.isFinite(num) ? num : undefined
        }
      }

      const key = parseHandleMeta(connection.targetHandle, connection.target) as T

      record[key] = {
        sourceId: connection.source,
        sourceHandleId: connection.sourceHandle!,
        dataField,
        value,
      }
    }
    return record
  }, [connections, nodesById, variables])
}
