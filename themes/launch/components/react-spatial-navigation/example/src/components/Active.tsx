import React from 'react';
import { View, Text } from 'react-native-web';
import styles from '../styles';

export type ActiveProps = {
  program: {
    title: string;
    color: string;
  };
};

export const Active = ({ program }: ActiveProps): JSX.Element => {
  const style = {
    backgroundColor: program?.color || 'grey',
  };

  return (
    <View style={styles.activeWrapper}>
      <View style={[style, styles.activeProgram]} />
      <Text style={styles.activeProgramTitle}>{program?.title || 'No Program'}</Text>
    </View>
  );
};

export default Active;
