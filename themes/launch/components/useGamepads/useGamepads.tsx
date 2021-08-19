/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback } from 'react'
import { usePollGamepads } from './usePollGamepads'
import { ButtonAction } from './utils'

export const useGamepads = (mapping, dependencies) => {
   const callback = useCallback((buttonEvents) => {
      buttonEvents.forEach((event) => {
         // console.log(event)
         const button = mapping?.buttons?.[event.index]

         switch (event.type) {
            case ButtonAction.pressed: {
               if (typeof button?.press === 'function') button?.press()
               break
            }
            case ButtonAction.released: {
               if (typeof button?.release === 'function') button?.release()
               break
            }
         }
      })
   }, dependencies)

   usePollGamepads(callback, dependencies)
}

/**
 * Adds game controllers during connection event listener
 * @param {object} e
 */
// const connectGamepadHandler = (e: Event) => {
//    const gp = (e as GamepadEvent).gamepad
//    updateGamepad(gp)
// }

// Add event listener for gamepad connecting
// useEffect(() => {
//    window.addEventListener('gamepadconnected', connectGamepadHandler)

//    return () => window.removeEventListener('gamepadconnected', connectGamepadHandler)
// }, [])
