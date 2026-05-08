import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  data: string
  className?: string
}

export const Copy = ({ data, className }: Props) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(data)
    toast.success('Copied')
  }

  return (
    <p
      className={cn(
        'rounded-md border border-[#1F1F2E] bg-[#08080F] px-2.5 py-1.5',
        'text-[10px] font-mono leading-[13px] text-[#C8C8DC] break-all',
        'cursor-pointer hover:border-[#2A2A40] hover:text-foreground transition-colors',
        !data && 'text-[#6E6E80] italic',
        className
      )}
      onClick={handleCopy}
    >
      {data || '—'}
    </p>
  )
}
