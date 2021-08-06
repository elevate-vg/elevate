import React, { useEffect, useLayoutEffect } from 'react'
import throttle from 'lodash/throttle'
import { View } from 'react-native-web'
import { withFocusable, initNavigation } from './react-spatial-navigation/src'
import styles from '../styles'
// import MenuFocusable from './Menu'
import Content from './Content'

export type SpatialProps = {
   navigateByDirection: (direction: 'up' | 'down' | 'left' | 'right') => void
}

const useWheel = (fn: (event: Event) => void | undefined) => {
   return useEffect(() => {
      window.addEventListener('wheel', fn, { passive: false })

      return () => {
         window.removeEventListener('wheel', fn)
      }
   }, [fn])
}

const Spatial = ({ navigateByDirection }: SpatialProps) => {
   useLayoutEffect(() => {
      initNavigation({
         debug: false,
         visualDebug: false,
      })
   }, [])

   useWheel((event) => {
      event.preventDefault()
      throttledWheelHandler(event)
   })

   const wheelHandler = (event) => {
      event.preventDefault()
      const { deltaY, deltaX } = event

      if (deltaY > 1) {
         navigateByDirection('down')
      } else if (deltaY < 0) {
         navigateByDirection('up')
      } else if (deltaX > 1) {
         navigateByDirection('right')
      } else if (deltaX < 1) {
         navigateByDirection('left')
      }
   }

   const throttledWheelHandler = throttle(wheelHandler, 100, {
      trailing: false,
   })

   return (
      <View style={styles.wrapper}>
         {/* <MenuFocusable focusKey={'MENU'} /> */}
         <Content focusKey={'CONTENT'} />
      </View>
   )
}

export const SpatialFocusable = withFocusable()(Spatial)

export default SpatialFocusable
