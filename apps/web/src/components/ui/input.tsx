import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({
  className,
  type,
  color,
  onKeyDown,
  onKeyUp,
  ...props
}: React.ComponentProps<'input'> & { color: string }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onKeyDown?.(e)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onKeyUp?.(e)
  }

  return (
    <input
      type={type}
      style={
        {
          '--primary': color,
        } as React.CSSProperties
      }
      data-slot="input"
      className={cn(
        'placeholder:text-[#6E6E80] selection:bg-primary/30 selection:text-foreground',
        'h-7 w-full min-w-0 rounded-md border border-[#1F1F2E] bg-[#08080F]',
        'px-2.5 py-1 text-[11px] font-mono text-[#C8C8DC] leading-[14px]',
        'transition-colors outline-none',
        'focus-visible:border-[var(--primary)]',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      {...props}
    />
  )
}

export { Input }
