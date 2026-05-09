import { useReactFlow, type Node } from '@xyflow/react'
import { useCallback } from 'react'

export const useTypedReactFlow = () => {
  const reactFlowInstance = useReactFlow()

  const updateNodeData = useCallback(
    <T>(id: string, dataUpdate: Partial<T> | ((node: Node) => Partial<T>), options?: { replace: boolean }) => {
      return reactFlowInstance.updateNodeData(id, dataUpdate, options)
    },
    [reactFlowInstance]
  )

  return {
    ...reactFlowInstance,
    updateNodeData,
  }
}
