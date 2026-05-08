import { useLayoutEffect, useRef, useState } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { CommentNodeData, CommentNodeType } from '@/types/nodes/input/comment-node'
import { useTypedReactFlow } from '@/hooks/flow/use-typed-react-flow'
import { useBlurOnOutsideClick } from '@/hooks/use-blur-on-outside-click'
import { CustomNode } from '../../ui/custom-node'
import { cn } from '@/lib/utils'

export const CommentNode = (props: NodeProps<CommentNodeType>) => {
  const [text, setText] = useState(props.data?.text ?? '')
  const { updateNodeData } = useTypedReactFlow()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    updateNodeData<CommentNodeData>(props.id, { text: e.target.value })
  }

  useBlurOnOutsideClick(containerRef, textareaRef)

  // Auto-grow to fit content.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [text])

  return (
    <CustomNode {...props} className="!p-1">
      <div ref={containerRef}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Write a comment..."
          rows={2}
          className={cn(
            'nodrag box-border block w-full resize-none overflow-hidden p-2 rounded',
            'text-[10px] leading-snug text-foreground',
            'bg-transparent',
            'placeholder:text-muted-foreground/60',
            'focus:outline-none'
          )}
        />
      </div>
    </CustomNode>
  )
}
