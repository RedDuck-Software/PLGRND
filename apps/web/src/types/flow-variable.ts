export type FlowVariableType = 'string' | 'number' | 'boolean' | 'publicKey'

export interface FlowVariable {
  id: string
  name: string
  type: FlowVariableType
  value: string
}
