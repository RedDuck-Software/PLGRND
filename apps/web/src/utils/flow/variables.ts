import type { FlowVariable } from '@/types/flow-variable'

const VARIABLE_PATTERN = /\$([A-Za-z_][A-Za-z0-9_]*)/g
const EXACT_VARIABLE_PATTERN = /^\$([A-Za-z_][A-Za-z0-9_]*)$/

export const normalizeVariableName = (name: string) => {
  const normalized = name
    .replace(/^\$/, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40)

  if (!normalized) return ''
  return /^\d/.test(normalized) ? `_${normalized}` : normalized
}

const createVariableMap = (variables: FlowVariable[]) => {
  const map = new Map<string, FlowVariable>()
  variables.forEach((variable) => {
    const name = normalizeVariableName(variable.name)
    if (name && !map.has(name)) map.set(name, variable)
  })
  return map
}

export const resolveFlowVariables = (value: unknown, variables: FlowVariable[]) => {
  if (typeof value !== 'string' || variables.length === 0) return value

  const variableMap = createVariableMap(variables)
  const exactMatch = value.match(EXACT_VARIABLE_PATTERN)
  if (exactMatch) {
    const variable = variableMap.get(normalizeVariableName(exactMatch[1]))
    return variable ? variable.value : value
  }

  return value.replace(VARIABLE_PATTERN, (match, name: string) => {
    const variable = variableMap.get(normalizeVariableName(name))
    return variable ? variable.value : match
  })
}
