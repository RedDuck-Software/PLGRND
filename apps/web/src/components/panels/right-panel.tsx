import { useState } from 'react'
import {
  SlidersHorizontal,
  Braces,
  PanelRightClose,
  ArrowDownToDot,
  ArrowUpFromDot,
  Trash2,
  Copy as CopyIcon,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/stores/flow-store'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import { getNodeConfig } from '@/utils/node/node-config-registry'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { useReactFlow } from '@xyflow/react'
import type { NodeType } from '@/types/node'
import type { FlowVariable, FlowVariableType } from '@/types/flow-variable'
import { toast } from 'sonner'

type Tab = 'inspector' | 'variables'

export function RightPanel() {
  const [tab, setTab] = useState<Tab>('inspector')

  return (
    <aside className="flex flex-col w-[360px] shrink-0 border-l border-[#1F1F2E] bg-[#0E0E18] overflow-hidden">
      {/* Tab strip — 42px */}
      <div className="flex h-[42px] shrink-0 items-stretch border-b border-[#1F1F2E]">
        {/* Collapse column */}
        <div className="flex w-10 items-center justify-center border-r border-[#1F1F2E]">
          <button
            type="button"
            className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-[#1F1F2E] bg-[#13131D] hover:bg-[#1F1F2E] transition-colors"
            title="Collapse"
          >
            <PanelRightClose className="h-3.5 w-3.5 text-[#C8C8DC]" />
          </button>
        </div>
        {/* Tabs */}
        <Tab
          icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
          label="Inspector"
          active={tab === 'inspector'}
          onClick={() => setTab('inspector')}
        />
        <Tab
          icon={<Braces className="h-3.5 w-3.5" />}
          label="Variables"
          active={tab === 'variables'}
          onClick={() => setTab('variables')}
        />
      </div>

      {tab === 'inspector' && <InspectorTab />}
      {tab === 'variables' && <VariablesTab />}
    </aside>
  )
}

function Tab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-1 items-center justify-center gap-1.5 text-[13px] transition-colors',
        active
          ? 'text-foreground font-semibold'
          : 'text-[#8B8B9E] hover:text-foreground font-medium'
      )}
    >
      <span className={active ? 'text-[#9945FF]' : ''}>{icon}</span>
      {label}
      {active && (
        <span
          className="absolute -bottom-px left-1/2 h-0.5 w-16 -translate-x-1/2 bg-[#9945FF]"
          style={{ boxShadow: '0 0 8px #9945FF80' }}
        />
      )}
    </button>
  )
}

function InspectorTab() {
  const nodes = useFlowStore((s) => s.nodes)
  const { setNodes, setEdges } = useReactFlow()
  const selected = nodes.find((n) => (n as { selected?: boolean }).selected)

  if (!selected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="h-12 w-12 rounded-xl bg-[#13131D] border border-[#1F1F2E] flex items-center justify-center">
          <SlidersHorizontal className="h-5 w-5 text-[#8B8B9E]" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground">No node selected</p>
          <p className="mt-1 text-[11px] text-[#8B8B9E] leading-relaxed max-w-[240px]">
            Click a node on the canvas to inspect and edit its properties.
          </p>
        </div>
      </div>
    )
  }

  const config = getNodeConfig(selected.type as NodeType)
  const styles = getNodeStyles(selected.type as NodeType)
  const inputs = config.handles.filter((h) => h.type === 'target')
  const outputs = config.handles.filter((h) => h.type === 'source')

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== selected.id))
    setEdges((eds) =>
      eds.filter((e) => e.source !== selected.id && e.target !== selected.id)
    )
    toast.success('Node deleted')
  }

  const handleDuplicate = () => {
    const newId = `${selected.id}_copy_${Date.now()}`
    setNodes((nds) =>
      nds.concat({
        ...selected,
        id: newId,
        position: { x: selected.position.x + 30, y: selected.position.y + 30 },
        selected: false,
      })
    )
    toast.success('Node duplicated')
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Hero header — node identity */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[#1F1F2E] px-4 pt-3.5 pb-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
          style={{ backgroundColor: styles.color }}
        >
          <DynamicIcon
            name={styles.icon as IconName}
            size={18}
            color="#08080F"
            strokeWidth={2.5}
          />
        </div>
        <div className="min-w-0 flex flex-col gap-0.5 flex-1">
          <span className="text-[13px] font-semibold text-foreground leading-none">
            {config.label
              .toLowerCase()
              .split('_')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')}
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: styles.color }}
          >
            {styles.category}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={handleDuplicate}
            title="Duplicate"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8B8B9E] hover:bg-[#1F1F2E] hover:text-foreground transition-colors"
          >
            <CopyIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8B8B9E] hover:bg-[#F43F5E]/15 hover:text-[#F43F5E] transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* Node ID */}
        <Field label="Node ID">
          <code className="block w-full rounded-md border border-[#1F1F2E] bg-[#08080F] px-2.5 py-1.5 text-[10px] font-mono text-[#8B8B9E] truncate">
            {selected.id}
          </code>
        </Field>

        {/* Position */}
        <Field label="Position">
          <div className="grid grid-cols-2 gap-1.5">
            <PositionInput
              label="X"
              value={Math.round(selected.position.x)}
              onChange={(v) =>
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === selected.id
                      ? { ...n, position: { ...n.position, x: v } }
                      : n
                  )
                )
              }
            />
            <PositionInput
              label="Y"
              value={Math.round(selected.position.y)}
              onChange={(v) =>
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === selected.id
                      ? { ...n, position: { ...n.position, y: v } }
                      : n
                  )
                )
              }
            />
          </div>
        </Field>

        {/* Inputs */}
        {inputs.length > 0 && (
          <Field
            label={
              <span className="flex items-center gap-1.5">
                <ArrowDownToDot className="h-3 w-3" />
                Inputs ({inputs.length})
              </span>
            }
          >
            <div className="flex flex-col gap-1">
              {inputs.map((h) => (
                <PortRow
                  key={h.dataField as string}
                  name={(h.label || h.dataField) as string}
                  type={(h as { dataType?: string }).dataType || 'any'}
                  color={styles.color}
                />
              ))}
            </div>
          </Field>
        )}

        {/* Outputs */}
        {outputs.length > 0 && (
          <Field
            label={
              <span className="flex items-center gap-1.5">
                <ArrowUpFromDot className="h-3 w-3" />
                Outputs ({outputs.length})
              </span>
            }
          >
            <div className="flex flex-col gap-1">
              {outputs.map((h) => (
                <PortRow
                  key={h.dataField as string}
                  name={(h.label || h.dataField) as string}
                  type={(h as { dataType?: string }).dataType || 'any'}
                  color={styles.color}
                />
              ))}
            </div>
          </Field>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B8B9E]">
        {label}
      </span>
      {children}
    </div>
  )
}

function PositionInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-[#1F1F2E] bg-[#08080F] px-2 py-1">
      <span className="text-[9px] font-mono font-semibold text-[#6E6E80]">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-transparent text-[11px] font-mono text-foreground tabular-nums outline-none"
      />
    </div>
  )
}

function PortRow({ name, type, color }: { name: string; type: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[#1F1F2E] bg-[#08080F] px-2.5 py-1.5">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="flex-1 truncate text-[11px] font-mono text-[#C8C8DC]">{name}</span>
      <span
        className="rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wide"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {type}
      </span>
    </div>
  )
}

const TYPE_COLOR: Record<FlowVariable['type'], string> = {
  string: '#FF8A4C',
  number: '#5B9BFF',
  publicKey: '#9945FF',
  boolean: '#FFB849',
}

const VARIABLE_TYPES = ['string', 'number', 'boolean', 'publicKey'] satisfies FlowVariableType[]

function VariablesTab() {
  const variables = useFlowStore((s) => s.variables)
  const addVariable = useFlowStore((s) => s.addVariable)
  const updateVariable = useFlowStore((s) => s.updateVariable)
  const deleteVariable = useFlowStore((s) => s.deleteVariable)

  const nameCounts = variables.reduce<Record<string, number>>((acc, variable) => {
    acc[variable.name] = (acc[variable.name] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F1F2E] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#C8C8DC]">
            Flow Variables
          </span>
          <span className="rounded-md border border-[#1F1F2E] bg-[#13131D] px-1.5 py-0.5 text-[10px] font-mono text-[#8B8B9E]">
            {variables.length}
          </span>
        </div>
        <button
          type="button"
          onClick={addVariable}
          className="flex items-center gap-1 rounded-md bg-[#9945FF] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#8438EE] transition-colors"
        >
          <Plus className="h-3 w-3" />
          New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
        {variables.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <div className="h-12 w-12 rounded-xl bg-[#13131D] border border-[#1F1F2E] flex items-center justify-center">
              <Braces className="h-5 w-5 text-[#8B8B9E]" />
            </div>
            <p className="text-[13px] font-medium text-foreground">No variables</p>
          </div>
        )}

        {variables.map((variable) => {
          const color = TYPE_COLOR[variable.type]
          const hasDuplicateName = Boolean(variable.name) && nameCounts[variable.name] > 1
          const isNameEmpty = variable.name.length === 0

          return (
            <div
              key={variable.id}
              className="rounded-lg border border-[#1F1F2E] bg-[#13131D] transition-colors p-2.5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[12px] font-mono font-bold"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  $
                </span>
                <input
                  value={variable.name}
                  onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                  className={cn(
                    'h-7 min-w-0 flex-1 rounded-md border bg-[#08080F] px-2 text-[11px] font-mono font-semibold text-foreground outline-none transition-colors',
                    hasDuplicateName || isNameEmpty
                      ? 'border-[#F43F5E]/60'
                      : 'border-[#1F1F2E] focus:border-[#9945FF]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => deleteVariable(variable.id)}
                  title="Delete variable"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8B8B9E] hover:bg-[#F43F5E]/15 hover:text-[#F43F5E] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-1.5">
                <select
                  value={variable.type}
                  onChange={(e) =>
                    updateVariable(variable.id, { type: e.target.value as FlowVariableType })
                  }
                  className="h-7 rounded-md border border-[#1F1F2E] bg-[#08080F] px-2 text-[10px] font-mono text-[#C8C8DC] outline-none focus:border-[#9945FF]"
                >
                  {VARIABLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <VariableValueInput
                  variable={variable}
                  color={color}
                  onChange={(value) => updateVariable(variable.id, { value })}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VariableValueInput({
  variable,
  color,
  onChange,
}: {
  variable: FlowVariable
  color: string
  onChange: (value: string) => void
}) {
  if (variable.type === 'boolean') {
    return (
      <select
        value={variable.value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 rounded-md border border-[#1F1F2E] bg-[#08080F] px-2 text-[10px] font-mono text-[#C8C8DC] outline-none focus:border-[#9945FF]"
      >
        <option value="">unset</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  }

  return (
    <input
      type={variable.type === 'number' ? 'number' : 'text'}
      value={variable.value}
      onChange={(e) => onChange(e.target.value)}
      style={{ '--primary': color } as React.CSSProperties}
      className="h-7 min-w-0 rounded-md border border-[#1F1F2E] bg-[#08080F] px-2 text-[10px] font-mono text-[#C8C8DC] outline-none transition-colors focus:border-[var(--primary)]"
    />
  )
}
