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

export const castVariableValue = (variable: FlowVariable): unknown => {
  const raw = variable.value.trim()

  if (variable.type === 'number') {
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : variable.value
  }

  if (variable.type === 'boolean') {
    const normalized = raw.toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
    return variable.value
  }

  return variable.value
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
    return variable ? castVariableValue(variable) : value
  }

  return value.replace(VARIABLE_PATTERN, (match, name: string) => {
    const variable = variableMap.get(normalizeVariableName(name))
    if (!variable) return match
    return String(castVariableValue(variable))
  })
}
