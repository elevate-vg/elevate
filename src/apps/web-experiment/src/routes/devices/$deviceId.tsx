import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/devices/$deviceId')({
  component: DeviceLayout,
  beforeLoad: ({ location, params }) => {
    // Redirect to view/game if hitting the device route directly
    if (location.pathname === `/devices/${params.deviceId}`) {
      throw redirect({
        to: '/devices/$deviceId/view/game',
        params: { deviceId: params.deviceId }
      })
    }
  }
})

function DeviceLayout() {
  return <Outlet />
}
