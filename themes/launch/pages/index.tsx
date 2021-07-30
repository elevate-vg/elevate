import React from 'react'
import { View } from 'react-native-web'
import { SpatialFocusable } from '../components/Spatial'
import styles from '../styles'

export const App = (): JSX.Element => (
   <View style={styles.container}>
      <SpatialFocusable focusable={false} />
   </View>
)

export default App
