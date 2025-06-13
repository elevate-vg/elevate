import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/devices/$deviceId/view/game/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/devices/$deviceId/view/game/home',
      params: { deviceId: params.deviceId }
    })
  }
})