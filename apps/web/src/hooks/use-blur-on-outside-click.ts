import { useEffect, type RefObject } from 'react'

/**
 * Blurs the focusable element when the user clicks outside the container.
 *
 * The xyflow pane swallows native focus changes (it calls preventDefault on
 * mousedown), so we listen at the document level for clicks elsewhere AND for
 * a custom "flow-pane-click" event dispatched from `<ReactFlow onPaneClick>`.
 */
export const useBlurOnOutsideClick = (
  containerRef: RefObject<HTMLElement | null>,
  focusableRef: RefObject<HTMLElement | null>
) => {
  useEffect(() => {
    const blurIfFocused = () => {
      if (document.activeElement === focusableRef.current) {
        focusableRef.current?.blur()
      }
    }
    const handleDown = (e: Event) => {
      const target = e.target as Node | null
      if (!target) return
      if (containerRef.current?.contains(target)) return
      blurIfFocused()
    }

    document.addEventListener('pointerdown', handleDown, true)
    window.addEventListener('flow-pane-click', blurIfFocused)

    return () => {
      document.removeEventListener('pointerdown', handleDown, true)
      window.removeEventListener('flow-pane-click', blurIfFocused)
    }
  }, [containerRef, focusableRef])
}
