import React from 'react'
import { View } from 'react-native-web'
import Spatial from '../components/Spatial'
import styles from '../styles'

export const App = (): JSX.Element => {
   console.count('<App /> render')

   return (
      <View style={styles.container}>
         <Spatial focusable={false} />
      </View>
   )
}

export default App
