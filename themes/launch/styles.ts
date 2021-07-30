import { StyleSheet } from 'react-native-web'

export const styles = StyleSheet.create({
   container: {
      height: '100vh',
   },
   wrapper: {
      flex: 1,
      backgroundColor: '#333333',
      flexDirection: 'row',
   },
   content: {
      flex: 1,
   },
   menu: {
      maxWidth: 60,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-around',
   },
   menuFocused: {
      backgroundColor: '#546e84',
   },
   menuItem: {
      width: 50,
      height: 50,
      backgroundColor: '#f8f258',
   },
   activeWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
   },
   activeProgram: {
      width: 160,
      height: 120,
   },
   activeProgramTitle: {
      padding: 20,
      color: 'white',
   },
   programWrapper: {
      padding: 10,
      alignItems: 'center',
   },
   program: {
      height: '25vh',
      width: '25vw',
   },
   programTitle: {
      color: 'white',
   },
   categoryWrapper: {
      padding: 20,
   },
   categoryTitle: {
      color: 'white',
   },
   categoriesWrapper: {
      flex: 1,
   },
   focusedBorder: {
      borderWidth: 6,
      borderColor: 'red',
      backgroundColor: 'white',
   },
})

export default styles
