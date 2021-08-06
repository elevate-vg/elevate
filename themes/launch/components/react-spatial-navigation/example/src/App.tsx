import React from 'react';
import { View } from 'react-native-web';
import { SpatialFocusable } from './components/Spatial';

export const App = (): JSX.Element => (
  <View>
    <SpatialFocusable focusable={false} />
  </View>
);

export default App;
