import { MousePointerClick, Library } from 'lucide-react'

interface Props {
  onBrowseBricks: () => void
}

export function EmptyState({ onBrowseBricks }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
      {/* Decorative radial glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%',
          left: '15%',
          width: 380,
          height: 380,
          background: 'radial-gradient(closest-side, rgba(153,69,255,0.18), transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '15%',
          right: '15%',
          width: 380,
          height: 380,
          background: 'radial-gradient(closest-side, rgba(20,241,149,0.12), transparent 70%)',
        }}
      />

      <div
        className="pointer-events-auto flex flex-col items-center gap-5 rounded-2xl px-10 py-9 text-center max-w-md"
        style={{
          background: 'rgba(14, 14, 24, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #1F1F2E',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        }}
      >
        <div className="relative">
          {/* Pulsing aura */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
              animation: 'auraPulse 2.4s ease-in-out infinite',
            }}
          />
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
              boxShadow: '0 8px 24px rgba(153,69,255,0.35)',
            }}
          >
            <Library className="h-7 w-7 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-[16px] font-semibold text-foreground tracking-tight">
            Start building your flow
          </h2>
          <p className="mt-2 text-[12px] text-[#8B8B9E] leading-relaxed">
            Drag a block from the library onto the canvas, then connect blocks to build
            your Solana flow.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={onBrowseBricks}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#9945FF] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#8438EE] transition-colors"
            style={{ boxShadow: '0 4px 12px rgba(153,69,255,0.4)' }}
          >
            <Library className="h-3.5 w-3.5" />
            Browse Blocks
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#6E6E80]">
          <MousePointerClick className="h-3 w-3" />
          <span>or press</span>
          <kbd className="rounded border border-[#1F1F2E] bg-[#13131D] px-1.5 py-0.5 font-mono">
            /
          </kbd>
          <span>to search blocks</span>
        </div>
      </div>
    </div>
  )
}
