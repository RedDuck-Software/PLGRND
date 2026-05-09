import { Panel } from '@xyflow/react'
import { ExampleFlowsModal } from './example-flows-modal'
import { useState } from 'react'
import { Library } from 'lucide-react'

export const FlowToolbar = () => {
  const [examplesOpen, setExamplesOpen] = useState(false)

  return (
    <>
      <Panel position="bottom-left">
        <button
          type="button"
          onClick={() => setExamplesOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-[#252525] bg-[#141414] px-3 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-[#1f1f1f] transition-colors cursor-pointer ml-1"
        >
          <Library className="h-3 w-3" />
          Examples
        </button>
      </Panel>
      <ExampleFlowsModal open={examplesOpen} onOpenChange={setExamplesOpen} />
    </>
  )
}
