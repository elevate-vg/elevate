interface NavigationDotsProps {
  total: number
  active: number
}

export function NavigationDots({ total, active }: NavigationDotsProps) {
  return (
    <div className="flex justify-center pt-6 gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full ${
            index === active
              ? 'bg-red-600 dark:bg-red-500'
              : 'bg-neutral-400 dark:bg-neutral-600'
          }`}
        />
      ))}
    </div>
  )
}