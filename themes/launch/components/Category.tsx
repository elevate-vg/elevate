/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useRef } from 'react'
import { View, Text, ScrollView } from 'react-native-web'
import { withFocusable } from '../../../libs/react-spatial-navigation/src'
import styles from '../styles'
import { ProgramFocusable } from './Program'
import shuffle from 'lodash/shuffle'
import { categories } from './Categories'
import { useQuery } from '@apollo/client'
import myQueryGql from '../queries/myQuery.gql'
import { StateContext } from './StateContext'
import { useLaunch } from '../utils'

export type Program = {
   title: string
   color: string
}

const programs: Program[] = shuffle([
   {
      title: 'Program 1',
      color: '#337fdd',
   },
   {
      title: 'Program 2',
      color: '#dd4558',
   },
   {
      title: 'Program 3',
      color: '#7ddd6a',
   },
   {
      title: 'Program 4',
      color: '#dddd4d',
   },
   {
      title: 'Program 5',
      color: '#8299dd',
   },
   {
      title: 'Program 6',
      color: '#edab83',
   },
   {
      title: 'Program 7',
      color: '#60ed9e',
   },
   {
      title: 'Program 8',
      color: '#d15fb6',
   },
   {
      title: 'Program 9',
      color: '#c0ee33',
   },
])

export type CategoryProps = {
   title: string
   onProgramPress: (programs: Program) => void
   realFocusKey: string
   categoryIndex: number
   setFocus: (str: string) => void
}

export const Category = ({
   title,
   // onProgramPress,
   realFocusKey,
   categoryIndex,
   setFocus,
}: CategoryProps): JSX.Element => {
   const launch = useLaunch()
   const { setFocusedItem } = useContext(StateContext)
   const { loading, error, data } = useQuery(myQueryGql)

   const scrollRef = useRef()

   const onProgramFocused =
      (entry) =>
      ({ x }) => {
         // @ts-ignore
         scrollRef?.current?.scrollTo({ x })
         setFocusedItem(entry)
      }

   // @ts-ignore
   const onProgramArrowPress = (direction, { categoryIndex, programIndex }) => {
      if (
         direction === 'right' &&
         programIndex === programs.length - 1 &&
         categoryIndex < categories.length - 1
      ) {
         setFocus(`CATEGORY-${categoryIndex + 1}`)

         return false
      }

      return true
   }

   if (loading) return null
   if (error) return <ul>{error}</ul>

   // console.log({ pid: launchData?.launch, launchVariables })

   return (
      <View style={styles.categoryWrapper}>
         <Text style={styles.categoryTitle}>{title}</Text>
         <ScrollView showsVerticalScrollIndicator={false} horizontal ref={scrollRef}>
            {data?.catalog?.slice(0, 10).map((entry, index) => (
               <ProgramFocusable
                  title={entry?.titles?.[0]?.name.split('').splice(0, 8).join('')}
                  color="#000000"
                  focusKey={`PROGRAM-${realFocusKey}-${index}`}
                  onPress={() => {
                     launch(entry)
                  }}
                  onEnterPress={() => {
                     launch(entry)
                  }}
                  image={`http://localhost:31348/~/@simonwjackson/hello/api/_depricated_GetFirstCoverArt/${entry?.titles?.[0]?.name} super nintendo`}
                  key={index}
                  onBecameFocused={onProgramFocused(entry)}
                  // onArrowPress={onProgramArrowPress}
                  programIndex={index}
                  categoryIndex={categoryIndex}
               />
            ))}
         </ScrollView>
      </View>
   )
}

export const CategoryFocusable = withFocusable()(Category)

export default CategoryFocusable
