import { useCallback, useState } from 'react'
import { useGamepadPoll } from './useGamepadPoll'

// TODO: this gets called twice with every event (possibly due to setState)
export const useGamepadState = () => {
   const [state, setState] = useState()

   const callback = useCallback(
      (gamepads, diff) => {
         if (diff.length) setState(gamepads)
      },
      [state],
   )

   useGamepadPoll(callback)

   return state
}
