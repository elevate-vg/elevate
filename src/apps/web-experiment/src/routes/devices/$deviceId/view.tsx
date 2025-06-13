import { createFileRoute, Outlet } from '@tanstack/react-router'

type Device = {
  id: string
  name: string
  width: number
  height: number
}

const devices: Device[] = [
  { id: 'retroid', name: 'Retroid Pocket 5 Mini', width: 430, height: 374 },
  { id: 'zfold', name: 'Zfold 6', width: 843, height: 724 },
  { id: 'samsung-s9', name: 'Samsung S9', width: 1330, height: 831 },
]

export const Route = createFileRoute('/devices/$deviceId/view')({
  component: DeviceView,
  validateSearch: (search) => ({
    scale: search.scale as number | undefined,
  }),
})

function DeviceView() {
  const { deviceId } = Route.useParams()
  const { scale: searchScale } = Route.useSearch()

  const device = devices.find(d => d.id === deviceId)

  if (!device) {
    return <div className="text-center p-4">Device not found</div>
  }

  const getScale = (device: Device) => {
    if (searchScale) return searchScale

    const maxWidth = window.innerWidth - 64
    const maxHeight = window.innerHeight - 200

    const scaleX = device.width > maxWidth ? maxWidth / device.width : 1
    const scaleY = device.height > maxHeight ? maxHeight / device.height : 1

    return Math.min(scaleX, scaleY)
  }

  const scale = getScale(device)

  return (
    <div className="flex flex-col justify-center items-center gap-8 p-8 overflow-scroll bg-neutral-100 transition-colors duration-300">
      <div 
        className="overflow-auto rounded-lg shadow-2xl"
        style={{
          width: `${device.width}px`,
          height: `${device.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}