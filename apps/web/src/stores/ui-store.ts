import { create } from 'zustand'

export type CanvasTool = 'select' | 'pan'

interface UIState {
  leftCollapsed: boolean
  rightCollapsed: boolean
  canvasTool: CanvasTool
  cursorPosition: { x: number; y: number } | null
  setLeftCollapsed: (v: boolean) => void
  setRightCollapsed: (v: boolean) => void
  setCanvasTool: (tool: CanvasTool) => void
  setCursorPosition: (pos: { x: number; y: number } | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  leftCollapsed: false,
  rightCollapsed: false,
  canvasTool: 'select',
  cursorPosition: null,
  setLeftCollapsed: (v) => set({ leftCollapsed: v }),
  setRightCollapsed: (v) => set({ rightCollapsed: v }),
  setCanvasTool: (tool) => set({ canvasTool: tool }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
}))
