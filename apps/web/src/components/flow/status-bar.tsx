import { Crosshair, Activity, Cpu, Globe, Zap } from 'lucide-react'

export function StatusBar() {
  return (
    <footer className="flex h-9 shrink-0 items-center justify-between border-t border-[#1F1F2E] bg-background px-4 text-[10px] font-mono">
      {/* Left — Live pill + ticks + cycle */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center gap-1.5 rounded-full border border-[#14F195]/40 bg-[#14F195]/10 px-2 py-0.5"
          style={{ boxShadow: '0 0 8px rgba(20,241,149,0.15)' }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#14F195]"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
          <span className="text-[10px] font-semibold text-[#14F195] tracking-wide">
            Live
          </span>
        </div>
        <div className="h-3 w-px bg-[#1F1F2E]" />
        <div className="flex items-center gap-1 text-[#8B8B9E]">
          <Activity className="h-3 w-3" />
          <span className="tabular-nums">312 ticks</span>
        </div>
        <div className="flex items-center gap-1 text-[#8B8B9E]">
          <Zap className="h-3 w-3" />
          <span className="tabular-nums">cycle 04</span>
        </div>
      </div>

      {/* Center — selection info */}
      <div className="flex items-center gap-1.5 text-[#8B8B9E]">
        <Crosshair className="h-3 w-3" />
        <span className="font-mono font-semibold text-foreground">flow.idle()</span>
        <span className="text-[#3A3A4D]">·</span>
        <span>no selection</span>
      </div>

      {/* Right — network / slot / RPC */}
      <div className="flex items-center gap-2.5 text-[#8B8B9E]">
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-[#9945FF]" />
          <span>devnet</span>
        </div>
        <div className="h-3 w-px bg-[#1F1F2E]" />
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          <span>slot <span className="tabular-nums text-foreground">312,841,920</span></span>
        </div>
        <div className="h-3 w-px bg-[#1F1F2E]" />
        <span className="tabular-nums">RPC 41ms</span>
      </div>
    </footer>
  )
}
