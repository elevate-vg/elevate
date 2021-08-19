import React, { useEffect } from 'react'

export const useAnimationFrame = (
   ref: React.MutableRefObject<number>,
   fn: () => void,
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   dependencies: any[] = [],
) => {
   useEffect(() => {
      ref.current = requestAnimationFrame(fn)
      return () => cancelAnimationFrame(ref.current)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, dependencies)
}
