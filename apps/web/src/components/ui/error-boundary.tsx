import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary'
import type { ReactNode } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

interface ErrorBoundaryProps {
  children: ReactNode
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.toString()
  return String(error)
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const errorMessage = getErrorMessage(error)

  const handleCopyError = async () => {
    await navigator.clipboard.writeText(errorMessage)
    toast.success('Error copied to clipboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-6 p-8">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-3xl">PLGRND</h1>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Ohh noo! Something went wrong</h2>
          <p className="text-muted-foreground max-w-md">Please contact developer with that error</p>
        </div>

        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center justify-center cursor-pointer rounded-sm bg-primary hover:bg-primary/90 px-8 py-3 text-sm font-medium text-primary-foreground outline-none transition-all disabled:pointer-events-none disabled:opacity-50"
        >
          Reload
        </button>

        {errorMessage && (
          <div className="mt-4 max-w-2xl w-full">
            <Accordion type="single" collapsible>
              <AccordionItem value="error-details" className="border-border">
                <AccordionTrigger className="text-xs text-muted-foreground hover:text-foreground">
                  Error details
                </AccordionTrigger>
                <AccordionContent>
                  <div className="relative">
                    <button
                      onClick={handleCopyError}
                      className="absolute top-2 right-2 p-2 rounded hover:bg-accent transition-colors cursor-pointer"
                      title="Copy error"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                    <pre className="p-4 bg-muted rounded overflow-auto text-xs">{errorMessage}</pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  )
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by ErrorBoundary:', error, errorInfo)
      }}
      onReset={() => {
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
