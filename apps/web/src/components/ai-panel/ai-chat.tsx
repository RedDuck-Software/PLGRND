import { useEffect, useRef, useState } from 'react'
import { SendHorizonal, Sparkles, Check, AlertCircle, ChevronDown, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiMessage } from './types'
import { buildFlowWithAi, type FlowResponse } from '@/utils/ai/ai-client'
import { AI_PROVIDERS, DEFAULT_PROVIDER_ID, type AiProvider } from '@/utils/ai/providers'

interface Props {
  onApplyFlow: (flow: FlowResponse) => void
}

const INITIAL_MESSAGES: AiMessage[] = [
  {
    id: '1',
    role: 'ai',
    content: "Hi! Describe a Solana flow and I'll wire it up on the canvas.",
  },
]

const SUGGESTIONS = [
  'Hash a message and sign it with a keypair',
  'Generate a keypair and check SOL balance on devnet',
  'Build a full transaction from keypair to send',
]

export const AiChat = ({ onApplyFlow }: Props) => {
  const [messages, setMessages] = useState<AiMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [providerId, setProviderId] = useState(DEFAULT_PROVIDER_ID)
  const [providerMenuOpen, setProviderMenuOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeProvider = AI_PROVIDERS.find((p) => p.id === providerId) ?? AI_PROVIDERS[0]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: trimmed }])
    setInput('')
    setIsThinking(true)

    try {
      const flow = await buildFlowWithAi(trimmed, activeProvider)
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', content: flow.description || 'Here is the flow:', flow },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ai',
          content: 'Something went wrong.',
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation()
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} onApplyFlow={onApplyFlow} />
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AiAvatar />
            <ThinkingDots />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-3 pb-2 flex flex-col gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-left text-[10px] px-2.5 py-1.5 rounded-lg border border-border hover:bg-border transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-border p-3 flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe a Solana flow..."
          rows={2}
          className="w-full resize-none bg-transparent text-[11px] leading-relaxed placeholder:text-muted-foreground outline-none"
        />
        <div className="flex items-center justify-between">
          <ProviderSelector
            providers={AI_PROVIDERS}
            activeProvider={activeProvider}
            open={providerMenuOpen}
            onToggle={() => setProviderMenuOpen((v) => !v)}
            onSelect={(p) => { setProviderId(p.id); setProviderMenuOpen(false) }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isThinking}
            className="size-6 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <SendHorizonal className="size-3 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

const ProviderSelector = ({
  providers,
  activeProvider,
  open,
  onToggle,
  onSelect,
}: {
  providers: AiProvider[]
  activeProvider: AiProvider
  open: boolean
  onToggle: () => void
  onSelect: (p: AiProvider) => void
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {activeProvider.label}
      <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
    </button>
    {open && (
      <div className="absolute bottom-full mb-1 left-0 bg-background border border-border rounded-lg overflow-hidden shadow-md z-50 min-w-[120px]">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={cn(
              'w-full text-left px-3 py-2 text-[10px] hover:bg-border transition-colors cursor-pointer',
              p.id === activeProvider.id && 'text-violet-400'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    )}
  </div>
)

const Message = ({ msg, onApplyFlow }: { msg: AiMessage; onApplyFlow: (flow: FlowResponse) => void }) => {
  const isAi = msg.role === 'ai'
  return (
    <div className={cn('flex gap-2', !isAi && 'flex-row-reverse')}>
      {isAi && <AiAvatar />}
      <div className={cn('flex flex-col gap-2 max-w-[85%]', !isAi && 'items-end')}>
        <div
          className={cn(
            'text-[11px] leading-relaxed rounded-xl px-3 py-2',
            isAi ? 'bg-border/60 rounded-tl-none' : 'bg-violet-600/20 rounded-tr-none',
            msg.error && 'border border-destructive/40'
          )}
        >
          {msg.content}
          {msg.error && (
            <div className="flex items-center gap-1 mt-1 text-destructive text-[10px]">
              <AlertCircle className="size-3" /> {msg.error}
            </div>
          )}
        </div>
        {msg.flow && <FlowCard flow={msg.flow} onApplyFlow={onApplyFlow} />}
      </div>
    </div>
  )
}

const FlowCard = ({
  flow,
  onApplyFlow,
}: {
  flow: FlowResponse
  onApplyFlow: (flow: FlowResponse) => void
}) => {
  const [applied, setApplied] = useState(false)

  const handleApply = () => {
    onApplyFlow(flow)
    setApplied(true)
  }

  return (
    <div className="bg-background border border-border rounded-lg p-2.5 flex flex-col gap-2 w-full">
      <div className="flex flex-col gap-1">
        {flow.nodes.map((n) => (
          <span key={n.id} className="text-[10px] text-muted-foreground font-mono">
            <span className="text-violet-400 mr-1">add_node</span>
            {n.type}
          </span>
        ))}
        {flow.edges.map((e, i) => (
          <span key={i} className="text-[10px] text-muted-foreground font-mono">
            <span className="text-sky-400 mr-1">connect</span>
            {e.from}.{e.fromHandle} → {e.to}.{e.toHandle}
          </span>
        ))}
        {flow.unknownTypes && flow.unknownTypes.length > 0 && (
          <div className="flex items-start gap-1 mt-1 text-amber-400 text-[10px]">
            <TriangleAlert className="size-3 shrink-0 mt-px" />
            <span>Not yet implemented: {flow.unknownTypes.join(', ')}</span>
          </div>
        )}
      </div>
      <button
        onClick={handleApply}
        disabled={applied}
        className={cn(
          'flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-md transition-colors cursor-pointer',
          applied
            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 cursor-default'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        )}
      >
        {applied ? <><Check className="size-3" /> Applied to canvas</> : 'Apply to canvas'}
      </button>
    </div>
  )
}

const AiAvatar = () => (
  <div className="size-5 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
    <Sparkles className="size-3 text-violet-400" />
  </div>
)

const ThinkingDots = () => (
  <div className="flex gap-1 items-center h-4">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="size-1 rounded-full bg-muted-foreground animate-bounce"
        style={{ animationDelay: `${i * 150}ms` }}
      />
    ))}
  </div>
)
