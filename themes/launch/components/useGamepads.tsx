import { always, call, identity, ifElse } from 'ramda'
import React, { useEffect, useState, useCallback } from 'react'

export const useTicker = (threshold: number, callback) => {
   // Use useRef for mutable variables that we want to persist
   // without triggering a re-render on their change
   const requestRef = React.useRef<number>()
   const previousTimeRef = React.useRef<number>()

   const animate = (time: number) => {
      if (previousTimeRef.current == undefined) {
         previousTimeRef.current = time
      }
      // prev gamepad vs new gamepad
      // if diff
      //   then fire callback
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
   }, []) // Make sure the effect runs only once
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

export enum ButtonEvent {
   released = -1,
   pressed = 1,
}

const detectButtonChange = (prev, next, button): ButtonEvent => {
   if (!prev?.[button]?.pressed && next?.[0]?.buttons?.[button]?.pressed) {
      return ButtonEvent.pressed
   } else if (prev?.[button]?.pressed && !next?.[0]?.buttons?.[button]?.pressed) {
      return ButtonEvent.released
   }
}

const detectButtonChanges = (prev, next, callbacks) => {
   const changes = []
   for (let i = 0; i < next?.[0]?.buttons?.length; i++) {
      const change = detectButtonChange(prev, next, i)
      if (change) changes.push([i, change])

      // switch (change) {
      //    case ButtonEvent.pressed: {
      //       if (typeof callbacks?.buttons?.[i]?.press === 'function')
      //          callbacks?.buttons?.[i]?.press()
      //       break
      //    }

      //    case ButtonEvent.released: {
      //       if (typeof callbacks?.buttons?.[i]?.release === 'function')
      //          callbacks?.buttons?.[i]?.release()
      //       break
      //    }
      // }

      // if (change && typeof callbacks?.buttons?.[i]?.change === 'function')
      //    callbacks?.buttons?.[i]?.change(ButtonEvent[change])
   }
   return changes
}

export const isFunction = (arg: any) => typeof arg === 'function'

export const usePollGamepads = (callbacks, customGetGamepads = undefined) => {
   const getGamepads = () => window.navigator?.getGamepads() || {}
   const getGamepadsFn = ifElse(isFunction, identity, always(getGamepads))(customGetGamepads)

   const haveEvents = () =>
      'GamepadEvent' in window || 'WebKitGamepadEvent' in window || 'ongamepadconnected' in window

   const requestRef = React.useRef<number>()
   const previousTimeRef = React.useRef<number>()
   const previousGamepads = React.useRef({})

   // const newButtons = useCallback(() => {
   //    const pads = pollAllGamepads(getGamepadsFn)

   //    // return pads?.[0]?.buttons
   // }, [buttons, callbacks, getGamepadsFn])

   // eslint-disable-next-line react-hooks/exhaustive-deps
   const animate = (time: number) => {
      if (previousTimeRef.current == undefined) {
         previousTimeRef.current = time
      }
      const nextGamepads = pollAllGamepads(getGamepadsFn)
      const changes = detectButtonChanges(
         previousGamepads.current?.[0]?.buttons,
         nextGamepads,
         callbacks,
      )

      if (changes.length > 0) {
         const callbackObj = callbacks()
         previousGamepads.current = nextGamepads
         changes.map(([btnNum, state]) => {
            switch (state) {
               case ButtonEvent.pressed: {
                  if (typeof callbackObj?.buttons?.[btnNum]?.press === 'function')
                     callbackObj?.buttons?.[btnNum]?.press()
                  break
               }

               case ButtonEvent.released: {
                  if (typeof callbackObj?.buttons?.[btnNum]?.release === 'function')
                     callbackObj?.buttons?.[btnNum]?.release()
                  break
               }
            }

            // if (change && typeof callbackObj?.buttons?.[btnNum]?.change === 'function')
            //    callbackObj?.buttons?.[btnNum]?.change(ButtonEvent[change])
         })
      }

      requestRef.current = requestAnimationFrame(animate)
   }

   useEffect(() => {
      console.count('pre main loop')
      previousGamepads.current = pollAllGamepads(getGamepadsFn)
      requestRef.current = requestAnimationFrame(animate)

      return () => cancelAnimationFrame(requestRef.current)
   }, [animate, getGamepadsFn])

   return previousGamepads.current
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
