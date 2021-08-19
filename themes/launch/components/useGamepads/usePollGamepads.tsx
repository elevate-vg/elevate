import { isFunction, whenNotEmpty } from 'libs/utils'
import { always, identity, ifElse } from 'ramda'
import React, { useEffect } from 'react'
import { useAnimationFrame } from './useAnimationFrame'
import { getAllButtonChanges, pollAllGamepads } from './utils'

/*************
 * Main
 */

export const usePollGamepads = (callback, dependencies, gamepadsFunction = undefined) => {
   const tick = React.useRef<number>()
   const previousGamepads = React.useRef({})

   const getGamepads = () => window.navigator?.getGamepads() || {}

   // prettier-ignore
   const getGamepadsFn = ifElse(
      isFunction, 
      identity, 
      always(getGamepads)
   )(gamepadsFunction)

   // const haveEvents = () =>
   //    'GamepadEvent' in window || 'WebKitGamepadEvent' in window || 'ongamepadconnected' in window

   const animate = () => {
      const nextGamepads = pollAllGamepads(getGamepadsFn)
      const changes = getAllButtonChanges(previousGamepads?.current?.[0], nextGamepads?.[0])
      previousGamepads.current = nextGamepads

      // @ts-expect-error: Ramda false positive
      whenNotEmpty(callback, changes)

      tick.current = requestAnimationFrame(animate)
   }

   useEffect(() => {
      previousGamepads.current = pollAllGamepads(() => ({
         0: { buttons: [{ index: 0, pressed: false }] },
      }))
   }, [])

   useAnimationFrame(tick, animate, dependencies)
}
