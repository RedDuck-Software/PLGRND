export const PageLoader = () => {
  return (
    <div className="w-screen h-screen bg-background absolute flex items-center justify-center inset-0 z-50">
      <div className="flex items-center gap-2">
        <img src="/logo-light.svg" alt="logo" className="sm:w-24 sm:h-24 w-10 h-10" />
        <h1 className="font-mono sm:text-6xl text-xl">PLGRND</h1>
      </div>
    </div>
  )
}
