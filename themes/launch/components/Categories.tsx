import React, { useRef } from 'react'
import { ScrollView } from 'react-native-web'
import { withFocusable } from '@noriginmedia/react-spatial-navigation'
import styles from '../styles'
import { CategoryFocusable } from './Category'
import shuffle from 'lodash/shuffle'

export const categories = shuffle([
   {
      title: 'Featured',
   },
   {
      title: 'Cool',
   },
   {
      title: 'Decent',
   },
])
export type CategoriesProps = {
   onProgramPress: () => void
   realFocusKey: string
}

export const Categories = ({ onProgramPress, realFocusKey }: CategoriesProps): JSX.Element => {
   const scrollRef = useRef<ScrollView>()
   const onCategoryFocused = ({ y }: { y: number }) => {
      scrollRef?.current.scrollTo({ y })
   }

   return (
      <ScrollView ref={scrollRef} style={styles.categoriesWrapper}>
         {[categories[0]].map(({ title }, index) => (
            <CategoryFocusable
               title={title}
               key={title}
               focusKey={`CATEGORY-${index}`}
               onProgramPress={onProgramPress}
               onBecameFocused={onCategoryFocused}
               categoryIndex={index}
            />
         ))}
      </ScrollView>
   )
}

export const CategoriesFocusable = withFocusable()(Categories)

export default CategoriesFocusable
