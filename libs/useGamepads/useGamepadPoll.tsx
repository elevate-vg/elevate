import { isFunction } from 'libs/utils'
import { always, identity, ifElse } from 'ramda'
import React, { useEffect } from 'react'
import { useAnimationFrame } from './useAnimationFrame'
import { getAllButtonChanges, pollAllGamepads } from './utils'

/*************
 * Main
 */

export const useGamepadPoll = (callback, dependencies: any = [], gamepadsFunction = undefined) => {
   const tickNum = React.useRef<number>(0)
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

   const tick = () => {
      const nextGamepads = pollAllGamepads(getGamepadsFn)
      // HACK: only checking first controller
      // HACK: only checking buttons
      const changes = getAllButtonChanges(previousGamepads?.current?.[0], nextGamepads?.[0])
      previousGamepads.current = nextGamepads

      if (changes) {
         callback(nextGamepads, changes)
      }

      tickNum.current = requestAnimationFrame(tick)
   }

   useEffect(() => {
      previousGamepads.current = pollAllGamepads(() => ({
         0: { buttons: [{ index: 0, pressed: false }] },
      }))
   }, [])

   useAnimationFrame(tickNum, tick, dependencies)
}
