import React, { useRef } from 'react';
import { View, Text, ScrollView } from 'react-native-web';
import withFocusable from '../../../src/withFocusable';
import styles from '../styles';
import { ProgramFocusable } from './Program';
import shuffle from 'lodash/shuffle';
import { categories } from './Categories';

export type Program = {
  title: string;
  color: string;
};

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
]);

export type CategoryProps = {
  title: string;
  onProgramPress: (programs: Program) => void;
  realFocusKey: string;
  categoryIndex: number;
  setFocus: (str: string) => void;
};

export const Category = ({
  title,
  onProgramPress,
  realFocusKey,
  categoryIndex,
  setFocus,
}: CategoryProps): JSX.Element => {
  const scrollRef = useRef();

  const onProgramFocused = ({ x }) => {
    scrollRef?.current?.scrollTo({ x });
  };

  const onProgramArrowPress = (direction, { categoryIndex, programIndex }) => {
    if (
      direction === 'right' &&
      programIndex === programs.length - 1 &&
      categoryIndex < categories.length - 1
    ) {
      setFocus(`CATEGORY-${categoryIndex + 1}`);

      return false;
    }

    return true;
  };

  return (
    <View style={styles.categoryWrapper}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <ScrollView horizontal ref={scrollRef}>
        {programs.map((program, index) => (
          <ProgramFocusable
            {...program}
            focusKey={`PROGRAM-${realFocusKey}-${index}`}
            onPress={() => onProgramPress(program)}
            onEnterPress={onProgramPress}
            key={program.title}
            onBecameFocused={onProgramFocused}
            onArrowPress={onProgramArrowPress}
            programIndex={index}
            categoryIndex={categoryIndex}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export const CategoryFocusable = withFocusable()(Category);

export default CategoryFocusable;
