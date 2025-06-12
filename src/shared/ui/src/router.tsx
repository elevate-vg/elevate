import { createRouter, createRoute, createRootRoute, Outlet, createMemoryHistory } from '@tanstack/react-router'
import { Games } from './routes/Games'
import { Settings } from './routes/Settings'
import { Scanner } from './routes/Scanner'
import { Navigation } from './components/Navigation'

// Root route component with layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="app-container">
      <Navigation />
      <main className="route-content">
        <Outlet />
      </main>
    </div>
  ),
})

// Index route (Games)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Games,
})

// Scanner route 
const scannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scanner',
  component: Scanner,
})

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  scannerRoute, 
  settingsRoute,
])

// Create and export the router
export const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  history: createMemoryHistory({
    initialEntries: ['/'], // Start at the games route
  }),
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}