import React, { useEffect } from 'react'

export const useTicker = (threshold: number, callback) => {
   // Use useRef for mutable variables that we want to persist
   // without triggering a re-render on their change
   const requestRef = React.useRef<number>()
   const previousTimeRef = React.useRef<number>()

   const animate = (time: number) => {
      if (previousTimeRef.current == undefined) {
         previousTimeRef.current = time
      }

      const deltaTime = time - previousTimeRef.current

      if (deltaTime >= threshold) {
         callback(deltaTime)
         previousTimeRef.current = time
      }

      requestRef.current = requestAnimationFrame(animate)
   }

   useEffect(() => {
      requestRef.current = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(requestRef.current)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])
}
