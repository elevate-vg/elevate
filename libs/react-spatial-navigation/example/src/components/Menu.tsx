import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native-web';
import withFocusable from '../../../src/withFocusable';
import { RETURN_KEY } from '../constants';
import styles from '../styles';

export type MenuItemProps = {
  focused: boolean;
};

export const MenuItem = ({ focused }: MenuItemProps): JSX.Element => (
  <TouchableOpacity style={[styles.menuItem, focused ? styles.focusedBorder : null]} />
);

export const MenuItemFocusable = withFocusable()(MenuItem);

export type MenuProps = {
  setFocus: () => void;
  hasFocusedChild: boolean;
};

export const Menu = ({ setFocus, hasFocusedChild }: MenuProps): JSX.Element => {
  useEffect(() => {
    const onPressKey = (event) => {
      if (event.keyCode === RETURN_KEY) {
        setFocus();
      }
    };

    setFocus();
    window.addEventListener('keydown', onPressKey);

    return () => {
      window.removeEventListener('keydown', onPressKey);
    };
  }, [setFocus]);

  return (
    <View style={[styles.menu, hasFocusedChild ? styles.menuFocused : null]}>
      <MenuItemFocusable focusKey={'MENU-1'} />
      <MenuItemFocusable focusKey={'MENU-2'} />
      <MenuItemFocusable focusKey={'MENU-3'} />
      <MenuItemFocusable focusKey={'MENU-4'} />
      <MenuItemFocusable focusKey={'MENU-5'} />
      <MenuItemFocusable focusKey={'MENU-6'} />
    </View>
  );
};

const MenuFocusable = withFocusable({
  trackChildren: true,
})(Menu);

export default MenuFocusable;
