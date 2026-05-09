import { memo } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Providers from '@/providers/Providers'
import { Header } from '@/components/header/header'
import { BrickLibrary } from '@/components/sidebar/brick-library'
import { RightPanel } from '@/components/panels/right-panel'
import { StatusBar } from '@/components/flow/status-bar'
import { CanvasToolbar } from '@/components/flow/canvas-toolbar'

const DefaultLayout = memo(() => {
  return (
    <Providers>
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <BrickLibrary />
          <main className="relative flex flex-1 flex-col overflow-hidden">
            <CanvasToolbar />
            <div className="relative flex-1 overflow-hidden">
              <Outlet />
            </div>
            <StatusBar />
          </main>
          <RightPanel />
        </div>
      </div>
      <Toaster />
    </Providers>
  )
})
DefaultLayout.displayName = 'DefaultLayout'

export default DefaultLayout
