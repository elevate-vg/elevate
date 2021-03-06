import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native-web'
import styles from '../styles'
import { withFocusable } from '../../../libs/react-spatial-navigation/src'

export type ProgramProps = {
   title: string
   color: string
   onPress: () => void
   focused: boolean
}

const initializer = (string = ''): string => {
   return string
      ?.split(' ')
      ?.map((word) => word.split('')?.[0])
      ?.splice(0, 2)
      .join('')
}
export const Program = ({ color, onPress, focused, title, image }: ProgramProps): JSX.Element => {
   const style = {
      backgroundColor: color,
      textAlign: 'center',
      justifyContent: 'center',
   }

   const text = {
      color: '#333333',
      fontWeight: 'bold',
      fontSize: '2.5rem',
      letterSpacing: '0rem',
   }

   // console.log(image)

   return (
      <TouchableOpacity onPress={onPress} style={styles.programWrapper}>
         <View
            style={[
               style,
               styles.program,
               focused ? styles.focusedBorder : null,
               {
                  backgroundImage: `url("${image}")`,
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
               },
            ]}>
            {/* <Text style={[text]}>{initializer(title)}</Text> */}
         </View>
         <Text style={styles.programTitle}>{title}</Text>
      </TouchableOpacity>
   )
}

export const ProgramFocusable = withFocusable()(Program)

export default ProgramFocusable
