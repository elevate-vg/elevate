import React, { useEffect, useState } from 'react';
import { View } from 'react-native-web';
import withFocusable from '../../../src/withFocusable';
import styles from '../styles';
import { KEY_ENTER, B_KEY } from '../constants';
import { Active } from './Active';
import { CategoriesFocusable } from './Categories';

export const Content = (): JSX.Element => {
  const [currentProgram, setCurrentProgram] = useState(null);
  const [blockNavigationOut, setBlockNavigationOut] = useState(false);

  useEffect(() => {
    const onPressKey = (event) => {
      if (event.keyCode === B_KEY) {
        console.warn(
          `blockNavigationOut: ${!blockNavigationOut}. Press B to ${
            blockNavigationOut ? 'block' : 'unblock '
          }`,
        );
        setBlockNavigationOut((bool) => !bool);
      }
    };

    window.addEventListener('keydown', onPressKey);

    return () => {
      window.removeEventListener('keydown', onPressKey);
    };
  }, []);

  const onProgramPress = (programProps, { pressedKeys } = {}) => {
    if (pressedKeys && pressedKeys[KEY_ENTER] > 1) {
      return;
    }

    setCurrentProgram(programProps);
  };

  return (
    <View style={styles.content}>
      <Active program={currentProgram} />
      <CategoriesFocusable
        focusKey={'CATEGORIES'}
        onProgramPress={onProgramPress}
        blockNavigationOut={blockNavigationOut}
      />
    </View>
  );
};

export const ContentFocusable = withFocusable()(Content);
export default ContentFocusable;
