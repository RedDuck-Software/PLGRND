import { useState } from 'react'
import {
  Sparkles,
  SlidersHorizontal,
  Braces,
  PanelRightClose,
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
  ArrowDownToDot,
  ArrowUpFromDot,
  Trash2,
  Copy as CopyIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/stores/flow-store'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import { getNodeConfig } from '@/utils/node/node-config-registry'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { useReactFlow } from '@xyflow/react'
import type { NodeType } from '@/types/node'
import { toast } from 'sonner'

type Tab = 'ai' | 'inspector' | 'variables'

const SUGGESTED_PROMPTS = [
  'Login with Phantom',
  'Send SOL',
  'Fetch Jupiter',
  'Verify a signature',
]

export function RightPanel() {
  const [tab, setTab] = useState<Tab>('ai')
  const [input, setInput] = useState('')

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
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label="AI Assistant"
          active={tab === 'ai'}
          onClick={() => setTab('ai')}
        />
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

      {tab === 'ai' && <AiTab input={input} setInput={setInput} />}
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

function AiTab({ input, setInput }: { input: string; setInput: (v: string) => void }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Hero header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[#1F1F2E] px-4 pt-3.5 pb-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)' }}
        >
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-foreground leading-none">
            Build with AI
          </span>
          <span className="text-[11px] text-[#8B8B9E] leading-snug">
            I'll scaffold flows, wire bricks, explain Solana.
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto p-3">
        {/* Assistant intro with gradient border */}
        <div
          className="rounded-xl bg-[#13131D] p-3 relative"
          style={{
            border: '1px solid transparent',
            backgroundImage:
              'linear-gradient(#13131D, #13131D), linear-gradient(135deg, #9945FF, #14F195)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bot className="h-3 w-3 text-[#9945FF]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A6FF]">
              Copilot
            </span>
          </div>
          <p className="text-[12px] text-[#C8C8DC] leading-relaxed">
            Hi! Tell me what you want to build and I'll scaffold the flow with the right
            blocks and connections.
          </p>
        </div>

        {/* User message right-aligned */}
        <div className="flex justify-end">
          <div className="flex items-start gap-1.5 max-w-[80%]">
            <div className="rounded-xl bg-[#9945FF]/15 border border-[#9945FF]/30 px-3 py-2">
              <p className="text-[12px] text-foreground leading-relaxed">
                Build a sandbox that hashes a message and signs it with a generated keypair
              </p>
            </div>
            <div className="h-6 w-6 shrink-0 rounded-full bg-[#13131D] border border-[#1F1F2E] flex items-center justify-center">
              <User className="h-3 w-3 text-[#8B8B9E]" />
            </div>
          </div>
        </div>

        {/* Assistant response */}
        <div className="rounded-xl bg-[#13131D] border border-[#1F1F2E] p-3">
          <p className="text-[12px] text-[#C8C8DC] leading-relaxed">
            On it. I'll wire <code className="text-[#5B9BFF] font-mono">TextInput</code> →{' '}
            <code className="text-[#14F195] font-mono">Hash</code> →{' '}
            <code className="text-[#14F195] font-mono">SignMessage</code> →{' '}
            <code className="text-[#3DD7E5] font-mono">Display</code>.
          </p>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setInput(prompt)}
            className="rounded-full border border-[#1F1F2E] bg-[#13131D] px-2.5 py-1 text-[10px] text-[#8B8B9E] hover:border-[#9945FF]/50 hover:text-foreground transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-[#1F1F2E] p-3 flex flex-col gap-2">
        <div className="rounded-lg border border-[#1F1F2E] bg-[#13131D] px-3 py-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            rows={2}
            className="w-full resize-none bg-transparent text-[12px] text-foreground placeholder:text-[#6E6E80] outline-none leading-relaxed"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ComposerBtn icon={<Paperclip className="h-3.5 w-3.5" />} title="Attach" />
            <ComposerBtn icon={<Mic className="h-3.5 w-3.5" />} title="Voice" />
          </div>
          <button
            type="button"
            onClick={() => setInput('')}
            disabled={!input.trim()}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all',
              input.trim()
                ? 'bg-[#9945FF] text-white hover:bg-[#8438EE] shadow-[0_2px_8px_rgba(153,69,255,0.4)]'
                : 'bg-[#1F1F2E] text-[#6E6E80] cursor-not-allowed'
            )}
          >
            <Send className="h-3 w-3" />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

function ComposerBtn({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md text-[#8B8B9E] hover:bg-[#1F1F2E] hover:text-foreground transition-colors"
    >
      {icon}
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

type FlowVariable = {
  id: string
  name: string
  type: 'string' | 'number' | 'publicKey' | 'boolean'
  scope: 'flow' | 'env'
  value: string
}

const SAMPLE_VARS: FlowVariable[] = [
  { id: 'v1', name: 'CLUSTER', type: 'string', scope: 'env', value: 'devnet' },
  {
    id: 'v2',
    name: 'PROGRAM_ID',
    type: 'publicKey',
    scope: 'flow',
    value: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
  { id: 'v3', name: 'MESSAGE', type: 'string', scope: 'flow', value: 'Hello, Solana' },
  { id: 'v4', name: 'RETRIES', type: 'number', scope: 'flow', value: '3' },
  { id: 'v5', name: 'DEBUG', type: 'boolean', scope: 'flow', value: 'true' },
]

const TYPE_COLOR: Record<FlowVariable['type'], string> = {
  string: '#FF8A4C',
  number: '#5B9BFF',
  publicKey: '#9945FF',
  boolean: '#FFB849',
}

function VariablesTab() {
  const [vars, setVars] = useState<FlowVariable[]>(SAMPLE_VARS)

  const addVar = () => {
    const id = `v${Date.now()}`
    setVars((prev) => [
      ...prev,
      { id, name: 'NEW_VAR', type: 'string', scope: 'flow', value: '' },
    ])
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F1F2E] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#C8C8DC]">
            Flow Variables
          </span>
          <span className="rounded-md border border-[#1F1F2E] bg-[#13131D] px-1.5 py-0.5 text-[10px] font-mono text-[#8B8B9E]">
            {vars.length}
          </span>
        </div>
        <button
          type="button"
          onClick={addVar}
          className="rounded-md bg-[#9945FF] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#8438EE] transition-colors"
        >
          + New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
        {vars.map((v) => {
          const color = TYPE_COLOR[v.type]
          return (
            <div
              key={v.id}
              className="rounded-lg border border-[#1F1F2E] bg-[#13131D] hover:border-[#2A2A40] transition-colors p-2.5"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <code className="text-[12px] font-mono font-semibold text-foreground">
                  ${v.name}
                </code>
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  {v.type}
                </span>
                <span className="ml-auto rounded border border-[#1F1F2E] bg-[#08080F] px-1.5 py-0.5 text-[9px] font-mono uppercase text-[#6E6E80]">
                  {v.scope}
                </span>
              </div>
              <div className="rounded-md border border-[#1F1F2E] bg-[#08080F] px-2 py-1">
                <code className="text-[10px] font-mono text-[#C8C8DC] break-all">
                  {v.value || <span className="text-[#6E6E80] italic">empty</span>}
                </code>
              </div>
            </div>
          )
        })}
        <p className="mt-2 px-2 text-[10px] text-[#6E6E80] leading-relaxed">
          Reference variables anywhere in the flow as{' '}
          <code className="font-mono text-[#9945FF]">$NAME</code>. Press{' '}
          <kbd className="rounded border border-[#1F1F2E] bg-[#13131D] px-1 py-0.5 font-mono">
            $
          </kbd>{' '}
          inside any input.
        </p>
      </div>
    </div>
  )
}
