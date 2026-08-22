import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createRootRoute({
  component: () => (
    <div className="w-full h-screen bg-black">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">Loading...</div>}>
        <Outlet />
      </Suspense>
    </div>
  ),
})
