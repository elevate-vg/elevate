import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import Constants from 'expo-constants';

export default function App() {
  // Only use keep awake when running in Expo Go
  if (Constants.executionEnvironment === 'storeClient') {
    useKeepAwake();
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
