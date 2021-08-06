import React, { useContext } from 'react'
import { View } from 'react-native-web'
import Spatial from '../components/Spatial'
import { StateContext } from '../components/StateContext'
import { usePollGamepads } from '../components/useGamepads'
import styles from '../styles'
import { useLaunch } from '../utils'
import SpatialNavigation from '../components/react-spatial-navigation/src/spatialNavigation'

export const App = (): JSX.Element => {
   const launch = useLaunch()
   const { focusedItem } = useContext(StateContext)
   console.count('<App /> render')

   usePollGamepads(
      () => ({
         buttons: {
            0: {
               press: () => {
                  console.log('A')
                  console.log(focusedItem)

                  if (focusedItem) {
                     console.log('trying to launch..')
                     launch(focusedItem)
                  }
               },
            },
            12: {
               // press: () => navigateByDirection('up'),
            },

            13: {
               // press: () => navigateByDirection('down'),
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
      }),
      // myCustomGamepadList,
   )

   // return <button onClick={() => {}}>click</button>

   return (
      <View style={styles.container}>
         <Spatial focusable={false} />
      </View>
   )
}

export default App
