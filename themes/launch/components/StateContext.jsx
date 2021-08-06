import { createContext, useState } from 'react'
import { usePollGamepads } from './useGamepads'
import SpatialNavigation from './react-spatial-navigation/src/spatialNavigation'

const myCustomGamepadList = () => {
   const randBool = Math.random() < 0.01

   const gamepadList = {
      0: {
         axes: [0, 0, 0, 0],
         buttons: [{ pressed: randBool, touched: false, value: randBool ? 1 : 0 }],
         connected: true,
         id: 'xbox 360',
         index: 0,
         mapping: 'standard',
         timestamp: 1231231231.234324534545,
         vibrationActuator: {
            type: 'dual-rumble',
         },
      },
   }

   return gamepadList
}

export const StateContext = createContext({})

export const StateProvider = ({ children }) => {
   const [focusedItem, setFocusedItem] = useState()

   return (
      <StateContext.Provider
         value={{
            focusedItem,
            setFocusedItem,
         }}>
         {children}
      </StateContext.Provider>
   )
}
