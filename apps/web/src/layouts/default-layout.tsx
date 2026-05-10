import { memo } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Providers from '@/providers/Providers'
import { Header } from '@/components/header/header'
import { BrickLibrary } from '@/components/sidebar/brick-library'
import { RightPanel } from '@/components/panels/right-panel'
import { StatusBar } from '@/components/flow/status-bar'
import { CanvasToolbar } from '@/components/flow/canvas-toolbar'
import { useUIStore } from '@/stores/ui-store'

const DefaultLayout = memo(() => {
  const leftCollapsed = useUIStore((s) => s.leftCollapsed)
  const rightCollapsed = useUIStore((s) => s.rightCollapsed)
  const setLeftCollapsed = useUIStore((s) => s.setLeftCollapsed)
  const setRightCollapsed = useUIStore((s) => s.setRightCollapsed)

  return (
    <Providers>
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <BrickLibrary collapsed={leftCollapsed} onToggle={() => setLeftCollapsed(!leftCollapsed)} />
          <main className="relative flex flex-1 flex-col overflow-hidden">
            <CanvasToolbar />
            <div className="relative flex-1 overflow-hidden">
              <Outlet />
            </div>
            <StatusBar />
          </main>
          <RightPanel collapsed={rightCollapsed} onToggle={() => setRightCollapsed(!rightCollapsed)} />
        </div>
      </div>
      <Toaster />
    </Providers>
  )
})
DefaultLayout.displayName = 'DefaultLayout'

export default DefaultLayout
