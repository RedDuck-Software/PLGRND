import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiChat } from './ai-chat'
import type { FlowResponse } from '@/utils/ai/tools'

type Tab = 'ai' | 'inspector' | 'variables'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'ai', label: 'AI Assistant', icon: <Sparkles className="size-3" /> },
]

interface Props {
  onApplyFlow: (flow: FlowResponse) => void
}

export const AiPanel = ({ onApplyFlow }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>('ai')

  return (
    <div className="w-80 shrink-0 border-l border-border bg-background flex flex-col h-full">
      <div className="flex border-b border-border shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-medium transition-colors cursor-pointer',
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-violet-500 -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'ai' && <AiChat onApplyFlow={onApplyFlow} />}
        {activeTab === 'inspector' && <EmptyTab label="Select a node to inspect it" />}
        {activeTab === 'variables' && <EmptyTab label="No variables defined yet" />}
      </div>
    </div>
  )
}

const EmptyTab = ({ label }: { label: string }) => (
  <div className="h-full flex items-center justify-center">
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
)
