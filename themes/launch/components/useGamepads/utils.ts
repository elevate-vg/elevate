/****************
 * Types
 */

import { allTrue, always, cond, curry, equals, T, whenNotNil } from '../../../../libs/utils'

export enum ButtonAction {
   released = -1,
   pressed = 1,
}

export type ButtonEvent = {
   index: number
   type: ButtonAction
}

export type GamepadChanges = [GamepadButton]

export const condDefault = <T>(any: T) => [T, always(any)]

// prettier-ignore
export const isPressed = (index: number, gamepad: Gamepad): boolean =>
   !!gamepad?.buttons?.[index]?.pressed

export const wasPressed = (index: number, prev: Gamepad, next: Gamepad) => {
   const isButtonIndexPressed = curry(isPressed)(index)
   const prevUp = equals(isButtonIndexPressed(prev))(false)
   const nextDown = equals(isButtonIndexPressed(next))(true)

   return allTrue([prevUp, nextDown])
}

export const wasReleased = (index: number, prev: Gamepad, next: Gamepad) =>
   isPressed(index, prev) === true && isPressed(index, next) === false

export const getButtonEvent = (
   index: number,
   prev: Gamepad,
   next: Gamepad,
): ButtonEvent | undefined =>
   cond([
      [
         wasPressed,
         () =>
            ({
               index,
               type: ButtonAction.pressed,
            } as ButtonEvent),
      ],
      [
         wasReleased,
         () =>
            ({
               index,
               type: ButtonAction.released,
            } as ButtonEvent),
      ],
      <undefined>condDefault(undefined),
   ])(index, prev, next)

export const getAllButtonChanges = (prev: Gamepad, next: Gamepad): ButtonEvent[] => {
   const changes: ButtonEvent[] = []

   for (let i = 0; i < next?.buttons?.length; i++) {
      const change = getButtonEvent(i, prev, next)

      whenNotNil(changes.push.bind(changes), change)
   }

   return changes
}

export const pollAllGamepads = (fn) => {
   const foundGamepads = fn()
   const pads = {}

   for (let i = 0; i < Object.keys(foundGamepads).length; i++) {
      if (foundGamepads[i]) {
         pads[i] = foundGamepads[i]
      }
   }

   return pads
}
