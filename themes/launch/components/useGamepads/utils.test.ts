import {
   // detectButtonChange,
   getAllButtonChanges,
   isPressed,
   wasPressed,
   wasReleased,
} from './utils'

test('isPressed', () => {
   expect(isPressed(0, { buttons: [{ pressed: true }] })).toBe(true)

   expect(isPressed(0, { buttons: [{ pressed: false }] })).toBe(false)
})

test('wasPressed', () => {
   const prevGamepadState = {
      buttons: [
         {
            pressed: false,
         },
         {
            pressed: true,
         },
         {
            pressed: false,
         },
      ],
   }

   const nextGamepadState = {
      buttons: [
         {
            pressed: true,
         },
         {
            pressed: true,
         },
         {
            pressed: false,
         },
      ],
   }

   const res = wasPressed(1, prevGamepadState, nextGamepadState)

   expect(res).toBe(false)
})

test('wasReleased', () => {
   const prevGamepadState = {
      buttons: [
         {
            index: 0,
            pressed: false,
         },
         {
            index: 7,
            pressed: true,
         },
         {
            index: 15,
            pressed: false,
         },
      ],
   }

   const nextGamepadState = {
      buttons: [
         {
            index: 0,
            pressed: true,
         },
         {
            index: 7,
            pressed: true,
         },
         {
            index: 15,
            pressed: false,
         },
      ],
   }

   const res = wasReleased(0, prevGamepadState, nextGamepadState)

   expect(res).toBe(false)
})

// describe('detectButtonChange', () => {
//    test('pressed', () => {
//       const prevGamepadState = {
//          buttons: [
//             {
//                index: 0,
//                pressed: false,
//             },
//             {
//                index: 7,
//                pressed: true,
//             },
//             {
//                index: 15,
//                pressed: false,
//             },
//          ],
//       }

//       const nextGamepadState = {
//          buttons: [
//             {
//                index: 0,
//                pressed: true,
//             },
//             {
//                index: 7,
//                pressed: true,
//             },
//             {
//                index: 15,
//                pressed: false,
//             },
//          ],
//       }

//       const change = detectButtonChange(
//          nextGamepadState.buttons[0],
//          prevGamepadState,
//          nextGamepadState,
//       )

//       expect(change).toBe(nextGamepadState.buttons[0])
//    })

//    test('released', () => {
//       const prevGamepadState = {
//          buttons: [
//             {
//                index: 0,
//                pressed: true,
//             },
//          ],
//       }

//       const nextGamepadState = {
//          buttons: [
//             {
//                index: 0,
//                pressed: false,
//             },
//          ],
//       }

//       const change = detectButtonChange(
//          nextGamepadState.buttons[0],
//          prevGamepadState,
//          nextGamepadState,
//       )

//       expect(change).toBe(nextGamepadState.buttons[0])
//    })
// })

test('getAllButtonChanges', () => {
   const prevGamepadState = {
      buttons: [
         {
            pressed: false,
         },
         {
            pressed: true,
         },
         {
            pressed: true,
         },
         {
            pressed: false,
         },
      ],
   }

   const nextGamepadState = {
      buttons: [
         {
            pressed: true,
         },
         {
            pressed: false,
         },
         {
            pressed: true,
         },
         {
            pressed: false,
         },
      ],
   }

   const changes = getAllButtonChanges(prevGamepadState, nextGamepadState)

   expect(changes).toEqual([
      {
         index: 0,
         type: 1,
      },
      {
         index: 1,
         type: -1,
      },
   ])
})

export default undefined
