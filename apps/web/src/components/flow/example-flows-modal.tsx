import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EXAMPLE_FLOWS, type ExampleFlow } from '@/constants/example-flows'
import { useFlowStore } from '@/stores/flow-store'
import { readFlowFromUrl } from '@/utils/flow/share'
import { ImageOff } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ExampleFlowsModal = ({ open, onOpenChange }: Props) => {
  const replaceFlow = useFlowStore((s) => s.replaceFlow)

  const handlePick = (example: ExampleFlow) => {
    if (!example.shareUrl) {
      toast.error('This example is not yet configured')
      return
    }
    const snapshot = readFlowFromUrl(new URL(example.shareUrl, window.location.href).href)
    if (!snapshot) {
      toast.error('Could not load example flow')
      return
    }
    replaceFlow({ ...snapshot, projectName: example.title })
    onOpenChange(false)
    toast.success(`Loaded "${example.title}"`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Example flows</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {EXAMPLE_FLOWS.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => handlePick(example)}
              className="group flex flex-col text-left rounded-md border border-border bg-[#141414] overflow-hidden hover:border-active-border hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <div className="aspect-video w-full bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
                {example.image ? (
                  <img
                    src={example.image}
                    alt={example.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImageOff className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="p-3 flex flex-col gap-1">
                <h3 className="text-sm font-mono font-semibold text-foreground">{example.title}</h3>
                <p className="text-xs text-muted-foreground leading-snug">{example.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
