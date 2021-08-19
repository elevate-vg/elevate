import { createContext, useState } from 'react'
import { useGamepads } from './useGamepads/useGamepads'
import { useLaunch } from '../utils'
import SpatialNavigation from '../components/react-spatial-navigation/src/spatialNavigation'

const buildGamepadMapping = ({ launch, focusedItem }) => ({
   buttons: {
      0: {
         release: () => {
            console.log('A release')
            console.log(focusedItem)

            if (focusedItem) {
               console.log('trying to launch..', focusedItem)
               launch(focusedItem)
            }
         },
      },
      12: {
         release: () => {
            SpatialNavigation.navigateByDirection('up')
            console.log('up')
         },
      },

      13: {
         release: () => {
            SpatialNavigation.navigateByDirection('down')
            console.log('down')
         },
      },

      14: {
         press: () => {
            SpatialNavigation.navigateByDirection('left')
            console.log('left')
         },
      },
      15: {
         press: () => {
            SpatialNavigation.navigateByDirection('right')
            console.log('right')
         },
      },
   },
})

// TODO: best practices: tying 2 contexts together

export const StateContext = createContext({})

export const StateProvider = ({ children }) => {
   const [focusedItem, setFocusedItem] = useState()
   const launch = useLaunch()

   useGamepads(buildGamepadMapping({ launch, focusedItem }), [focusedItem])

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
