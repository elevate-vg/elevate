import React, { useEffect, useLayoutEffect } from 'react';
import throttle from 'lodash/throttle';
import { View } from 'react-native-web';
import withFocusable from '../../../src/withFocusable';
import styles from '../styles';
import MenuFocusable from './Menu';
import { ContentFocusable } from './Content';
import SpatialNavigation from '../../../src/spatialNavigation';

export type SpatialProps = {
  navigateByDirection: (direction: 'up' | 'down' | 'left' | 'right') => void;
};

const Spatial = ({ navigateByDirection }: SpatialProps) => {
  useLayoutEffect(() => {
    SpatialNavigation.init({
      debug: false,
      visualDebug: false,
    });
  }, []);

  const wheelHandler = (event) => {
    event.preventDefault();
    const { deltaY, deltaX } = event;

    if (deltaY > 1) {
      navigateByDirection('down');
    } else if (deltaY < 0) {
      navigateByDirection('up');
    } else if (deltaX > 1) {
      navigateByDirection('right');
    } else if (deltaX < 1) {
      navigateByDirection('left');
    }
  };

  const throttledWheelHandler = throttle(wheelHandler, 250, {
    trailing: false,
  });

  const onWheel = (event) => {
    event.preventDefault();
    throttledWheelHandler(event);
  };

  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <View style={styles.wrapper}>
      <MenuFocusable focusKey={'MENU'} />
      <ContentFocusable focusKey={'CONTENT'} />
    </View>
  );
};

export const SpatialFocusable = withFocusable()(Spatial);

export default SpatialFocusable;
