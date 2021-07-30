import React, { useEffect, useState } from 'react'
import { View } from 'react-native-web'
import { withFocusable } from '@noriginmedia/react-spatial-navigation'
import styles from '../styles'
import { KEY_ENTER, B_KEY, RETURN_KEY } from '../constants'
import { Active } from './Active'
import { CategoriesFocusable } from './Categories'

const useOnPressKey = (keyCode, fn) => {
   const wrappedFn = (event) => {
      if (event.keyCode === keyCode) {
         fn(event)
      }
   }

   return useEffect(() => {
      window.addEventListener('keydown', wrappedFn)

      return () => {
         window.removeEventListener('keydown', wrappedFn)
      }
   }, [])
}

export const Content = ({ setFocus }): JSX.Element => {
   const [currentProgram, setCurrentProgram] = useState(null)
   const [blockNavigationOut, setBlockNavigationOut] = useState(false)

   useEffect(() => setFocus(), [])
   useOnPressKey(RETURN_KEY, setFocus)

   useOnPressKey(B_KEY, () => {
      console.warn(
         `blockNavigationOut: ${!blockNavigationOut}. Press B to ${
            blockNavigationOut ? 'block' : 'unblock '
         }`,
      )
      setBlockNavigationOut((bool) => !bool)
   })

   const onProgramPress = (programProps, { pressedKeys } = {}) => {
      if (pressedKeys && pressedKeys[KEY_ENTER] > 1) {
         return
      }

      setCurrentProgram(programProps)
   }

   return (
      <View style={styles.content}>
         {/* <Active program={currentProgram} /> */}
         <CategoriesFocusable
            focusKey={'CATEGORIES'}
            onProgramPress={onProgramPress}
            blockNavigationOut={blockNavigationOut}
         />
      </View>
   )
}

export const ContentFocusable = withFocusable({ trackChildren: true })(Content)
export default ContentFocusable
