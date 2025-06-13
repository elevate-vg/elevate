import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import './index.css'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

const devices = [
  { id: 'retroid', name: 'Retroid' },
  { id: 'zfold', name: 'Z Fold' },
  { id: 'samsung-s9', name: 'S9' },
]

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="sticky top-0 z-100 bg-white border-b border-neutral-200 px-4 py-3">
        <div className="flex gap-2 justify-center items-center">
          {devices.map(device => (
            <Link
              key={device.id}
              to="/devices/$deviceId"
              params={{ deviceId: device.id }}
              className="px-3 py-1 text-xs font-medium no-underline text-neutral-600 bg-neutral-100 rounded transition-all duration-200 hover:bg-neutral-200"
              activeProps={{
                className: "px-3 py-1 text-xs font-medium no-underline text-white bg-primary-500 rounded transition-all duration-200"
              }}
            >
              {device.name}
            </Link>
          ))}
        </div>
      </nav>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
