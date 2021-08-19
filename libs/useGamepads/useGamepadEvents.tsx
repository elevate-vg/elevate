import { useCallback } from 'react'
import { useGamepadPoll } from './useGamepadPoll'
import { ButtonAction } from './utils'

export const useGamepadEvents = (mapping, dependencies) => {
   const callback = useCallback((_, buttonEvents) => {
      buttonEvents.forEach((event) => {
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

   useGamepadPoll(callback, dependencies)
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
