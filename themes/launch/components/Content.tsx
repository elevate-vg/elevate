/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { View } from 'react-native-web'
import { withFocusable } from '../../../libs/react-spatial-navigation/src'
import styles from '../styles'
import { KEY_ENTER, B_KEY, RETURN_KEY } from '../constants'
// import { Active } from './Active'
import { CategoriesFocusable } from './Categories'
import Active from './Active'

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
   // @ts-ignore
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

   // @ts-ignore
   const onProgramPress = (programProps, { pressedKeys } = {}) => {
      if (pressedKeys && pressedKeys[KEY_ENTER] > 1) {
         return
      }

      setCurrentProgram(programProps)
   }

   return (
      <View style={styles.content}>
         {/* <Active program={currentProgram} /> */}
         <span data-info="hack to center align categories">
            <CategoriesFocusable
               focusKey={'CATEGORIES'}
               onProgramPress={onProgramPress}
               blockNavigationOut={blockNavigationOut}
            />
         </span>
      </View>
   )
}

export const ContentFocusable = withFocusable({ trackChildren: true })(Content)
export default ContentFocusable
