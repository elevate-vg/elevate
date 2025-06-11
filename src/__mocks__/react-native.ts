// Mock implementation of react-native for testing

export const Platform = {
  OS: 'ios' as 'ios' | 'android',
  select: (obj: { ios?: any; android?: any; default?: any }) => obj.ios || obj.default,
};

export const Dimensions = {
  get: () => ({ width: 375, height: 667 }),
  addEventListener: () => {},
  removeEventListener: () => {},
};

export const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (style: any) => style,
};

export const View = 'View';
export const Text = 'Text';
export const ScrollView = 'ScrollView';
export const Button = 'Button';
export const TextInput = 'TextInput';
export const Image = 'Image';
export const TouchableOpacity = 'TouchableOpacity';
export const SafeAreaView = 'SafeAreaView';

export const Alert = {
  alert: () => {},
};

export const Linking = {
  openURL: () => Promise.resolve(),
  canOpenURL: () => Promise.resolve(true),
};

export const NativeModules = {};

export const StatusBar = 'StatusBar';

export default {
  Platform,
  Dimensions,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Button,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  NativeModules,
  StatusBar,
};