import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-web';
import styles from '../styles';
import withFocusable from '../../../src/withFocusable';

export type ProgramProps = {
  title: string;
  color: string;
  onPress: () => void;
  focused: boolean;
};

export const Program = ({ color, onPress, focused, title }: ProgramProps): JSX.Element => {
  const style = {
    backgroundColor: color,
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.programWrapper}>
      <View style={[style, styles.program, focused ? styles.focusedBorder : null]} />
      <Text style={styles.programTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

export const ProgramFocusable = withFocusable()(Program);

export default ProgramFocusable;
