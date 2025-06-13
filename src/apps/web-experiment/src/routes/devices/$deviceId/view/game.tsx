import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Header } from '../../../../components/Header'
import { Navigation } from '../../../../components/Navigation'
import { Footer } from '../../../../components/Footer'

export const Route = createFileRoute('/devices/$deviceId/view/game')({
  component: GameLayout,
})

function GameLayout() {
  const [isDark, setIsDark] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [activeTab, setActiveTab] = useState('Home')
  const navigate = useNavigate()
  const { deviceId } = Route.useParams()

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      setCurrentTime(time)
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const tabs = ['Home', 'Library', 'Bazzar']

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const route = tab.toLowerCase()
    navigate({
      to: `/devices/$deviceId/view/game/${route}`,
      params: { deviceId }
    })
  }

  return (
    <div className="bg-neutral-200 dark:bg-neutral-900 flex flex-col rounded-lg shadow-2xl h-full">
      <Header
        currentTime={currentTime}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      <Navigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className="flex flex-col py-3 px-3 flex-1 min-h-0">
        <Outlet />
      </main>

      <Footer
        onCategoriesClick={() => console.log('Categories clicked')}
        onSearchClick={() => console.log('Search clicked')}
        onPlayClick={() => console.log('Play clicked')}
      />
    </div>
  )
}
