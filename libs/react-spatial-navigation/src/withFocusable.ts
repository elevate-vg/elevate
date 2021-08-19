/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/no-find-dom-node */
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import uniqueId from 'lodash/uniqueId';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import compose from 'recompose/compose';
import lifecycle from 'recompose/lifecycle';
import withHandlers from 'recompose/withHandlers';
import withContext from 'recompose/withContext';
import withStateHandlers from 'recompose/withStateHandlers';
import getContext from 'recompose/getContext';
import pure from 'recompose/pure';
import mapProps from 'recompose/mapProps';
import SpatialNavigation, { ROOT_FOCUS_KEY } from './spatialNavigation';

export type PressedKeys = {
  up?: 1;
  down?: 1;
  left?: 1;
  right?: 1;
  enter?: 1;
};

export type Details = {
  pressedKeys: PressedKeys;
};

export type Direction = 'up' | 'down' | 'left' | 'right';

export type FocusableSettings = {
  /**  Determine whether to track when any child component is focused.
   * Wrapped component can rely on hasFocusedChild prop when this mode is enabled.
   * Otherwise hasFocusedChild will be always false.
   * Disabled by default because it causes unnecessary render call when hasFocusedChild changes.
   */
  trackChildren?: boolean;
  /** Determine whether this component should not remember the last focused
   * child components. By default when focus goes away from the component and
   * then it gets focused again, it will focus the last focused child. This
   * functionality is enabled by default.
   */
  forgetLastFocusedChild?: boolean;

  /** To determine whether parent component should focus the first available
   * child component when currently focused child is unmounted.
   */
  autoRestoreFocus?: boolean;

  /** Disable the navigation out from the selected component. It can be
   * useful when a user opens a popup (or screen) and you don't want to
   * allow the user to focus other components outside this area. It
   * doesn't block focus set programmatically by setFocus.
   */
  blockNavigationOut?: boolean;
};

/**
 * Determine whether this component should be focusable (in other words,
 * whether it's currently participating in the spatial navigation tree).
 * This allows a focusable component to be ignored as a navigation target
 * despite being mounted (e.g. due to being off-screen, hidden, or
 * temporarily disabled).
 *
 * Note that behavior is undefined for trees of components in which an
 * focusable={false} component has any focusable={true} components as
 * descendants; it is recommended to ensure that all components in a given
 * branch of the spatial navigation tree have a common focusable state.
 * Also focusable={false} does not prevent component from being directly
 * focused with setFocus. It only blocks "automatic" focus logic such as
 * directional navigation, or focusing component as lastFocusedChild or
 * preferredFocusChild.
 *
 * Default: true
 */
export type focusable = boolean;

/**
 * String that is used as a component focus key.
 *
 * Should be unique, otherwise  it will override previously stored
 * component with the same focus key in the Spatial Navigation service
 * storage of focusable components. If this is not specified, the
 * focus key will be generated automatically.
 */
export type focusKey = string;

/**
 * Callback function that is called when the item is currently focused
 * and Enter (OK) key is pressed.
 */
export type onEnterPress = (props: WrappedComponentProps, details: Details) => undefined;

/**
 * Callback function that is called when the item is currently focused and Enter (OK) key is released.
 *
 * Payload:
 *
 * All the props passed to HOC is passed back to this callback.
 * Useful to avoid creating callback functions during render.
 *
 * Details - info about pressed keys
 * const onPress = ({prop1, prop2}, details) => {...};
 * const onRelease = ({prop1, prop2}) => {...};
 *
 * @example
 *
 *   <FocusableItem
 *     prop1={111}
 *     prop2={222}
 *     onEnterPress={onPress}
 *     onEnterRelease={onRelease}
 *   />
 */
export type onEnterRelease = (props: WrappedComponentProps) => undefined;

/**
 * Callback function that is called when the item becomes focused directly or when any of the children components become focused. For example when you have nested tree of 5 focusable components, this callback will be called on every level of down-tree focus change.
 *
 * Payload: The first parameter is the component layout object. The second paramter is an object containing all the component props. The third parameter is a details object that was used when triggering the focus change, for example it contains the key event in case of arrow navigation. Useful to avoid creating callback functions during render. x and y are relative coordinates to parent DOM (not the Focusable parent) element. left and top are absolute coordinates on the screen.
 *
 * @example
 * const onFocused = ({width, height, x, y, top, left, node}, {prop1, prop2}, {event, other}) => {...};
 *
 * <FocusableItem
 *   prop1={111}
 *   prop2={222}
 *   onBecameFocused={onFocused}
 * />
 */
export type onBecameFocused = (
  layout: unknown,
  props: WrappedComponentProps,
  details: Details,
) => undefined;

/**
 * Callback function that is called when the item loses focus or when all the children components lose focus. For example when you have nested tree of 5 focusable components, this callback will be called on every level of down-tree focus change.
 *
 * Payload: The first parameter is the component layout object. The second paramter is an object containing all the component props. The third parameter is a details object that was used when triggering the focus change, for example it contains the key event in case of arrow navigation. Useful to avoid creating callback functions during render. x and y are relative coordinates to parent DOM (not the Focusable parent) element. left and top are absolute coordinates on the screen.
 *
 * const onBlur = ({width, height, x, y, top, left, node}, {prop1, prop2}, {event, other}) => {...};
 *
 * <FocusableItem
 *   prop1={111}
 *   prop2={222}
 *   onBecameBlurred={onBlur}
 * />
 */
export type onBecameBlurred = (
  layout: unknown,
  props: WrappedComponentProps,
  details: Details,
) => undefined;

/**
 * Callback function that is called when the item is currently focused
 * and an arrow (LEFT, RIGHT, UP, DOWN) key is pressed.
 *
 * Payload:
 *
 * The directional arrow (left, right, up, down): string
 * All the props passed to HOC is passed back to this callback. Useful to avoid creating callback functions during render.
 * Details - info about pressed keys
 * Prevent default navigation: By returning false the default navigation behavior is prevented.
 *
 * @example
 *
 * const onPress = (direction, {prop1, prop2}) => {
 *    return false;
 * };
 *
 * <FocusableItem
 *    prop1={111}
 *    prop2={222}
 *    onArrowPress={onPress}
 * />
 */
export type onArrowPress = (
  direction: Direction,
  props: WrappedComponentProps,
  details: Details,
) => undefined;

export type WrappedComponentProps = {
  focusable: focusable;
  focusKey: focusKey;
  onEnterPress?: onEnterPress;
  onEnterRelease?: onEnterRelease;
  onArrowPress?: onArrowPress;
  onBecameFocused?: onBecameFocused;
  onBecameBlurred?: onBecameBlurred;
} & FocusableSettings;

export type HocProps = {
  onEnterPressHandler: onEnterPressHandler;
  onEnterReleaseHandler: onEnterReleaseHandler;
  onArrowPressHandler: onArrowPressHandler;
  onBecameFocusedHandler: onBecameFocusedHandler;
  onBecameBlurredHandler: onBecameBlurredHandler;
  focusable: focusable;
  onUpdateFocus: unknown;
  onUpdateHasFocusedChild: boolean;
  parentFocusKey: string;
  preferredChildFocusKey: string;
  realFocusKey: focusKey;
} & FocusableSettings;

export const omitProps = (keys) => mapProps((props) => omit(props, keys));

/**
 * Override the default settings object with user's custom configuration
 */
export const getConfig = (settings: FocusableSettings): FocusableSettings => {
  const defaults = {
    trackChildren: false,
    autoRestoreFocus: true,
    blockNavigationOut: false,
    forgetLastFocusedChild: false,
  } as FocusableSettings;

  return merge(defaults, settings);
};
export type onEnterPressHandler = (
  props: WrappedComponentProps,
) => (details: Details) => WrappedComponentProps['onEnterPress'];

export type onEnterReleaseHandler = (
  props: WrappedComponentProps,
) => () => WrappedComponentProps['onEnterRelease'];

export type onArrowPressHandler = (
  props: WrappedComponentProps,
) => (direction: Direction, details: Details) => WrappedComponentProps['onArrowPress'];

export type onBecameFocusedHandler = (
  props: WrappedComponentProps,
) => (layout: unknown, details: Details) => WrappedComponentProps['onBecameFocused'];

export type onBecameBlurredHandler = (
  props: WrappedComponentProps,
) => (layout: unknown, details: Details) => WrappedComponentProps['onBecameBlurred'];

const onEnterPressHandler: onEnterPressHandler =
  ({ onEnterPress = noop, ...props }) =>
  (details) =>
    onEnterPress(props, details);

const onEnterReleaseHandler: onEnterReleaseHandler =
  ({ onEnterRelease = noop, ...props }) =>
  () =>
    onEnterRelease(props);

const onArrowPressHandler: onArrowPressHandler =
  ({ onArrowPress = noop, ...props }) =>
  (direction, details) =>
    onArrowPress(direction, props, details);

const onBecameFocusedHandler: onBecameFocusedHandler =
  ({ onBecameFocused = noop, ...props }) =>
  (layout, details) =>
    onBecameFocused(layout, props, details);

const onBecameBlurredHandler: onBecameBlurredHandler =
  ({ onBecameBlurred = noop, ...props }) =>
  (layout, details) =>
    onBecameBlurred(layout, props, details);

const withFocusable = (settings?: FocusableSettings) => {
  const config = getConfig(settings);

  const handlers = withHandlers({
    onEnterPressHandler,
    onEnterReleaseHandler,
    onArrowPressHandler,
    onBecameFocusedHandler,
    onBecameBlurredHandler,
    pauseSpatialNavigation: () => SpatialNavigation.pause,
    resumeSpatialNavigation: () => SpatialNavigation.resume,
    updateAllSpatialLayouts: () => SpatialNavigation.updateAllLayouts,
  });

  const MyComponent = compose(
    getContext({
      /**
       * From the context provided by another higher-level 'withFocusable' component
       */
      parentFocusKey: PropTypes.string,
    }),

    withStateHandlers(
      ({ focusKey, parentFocusKey }) => {
        const realFocusKey = focusKey || uniqueId('sn:focusable-item-');

        return {
          realFocusKey,

          /**
           * This method is used to imperatively set focus to a component.
           * It is blocked in the Native mode because the native engine decides what to focus by itself.
           */
          setFocus: SpatialNavigation.isNativeMode()
            ? noop
            : SpatialNavigation.setFocus.bind(null, realFocusKey),

          navigateByDirection: SpatialNavigation.navigateByDirection,

          /**
           * In Native mode this is the only way to mark component as focused.
           * This method always steals focus onto current component no matter which arguments are passed in.
           */
          stealFocus: SpatialNavigation.setFocus.bind(null, realFocusKey, realFocusKey),
          focused: false,
          hasFocusedChild: false,
          parentFocusKey: parentFocusKey || ROOT_FOCUS_KEY,
        };
      },
      {
        onUpdateFocus:
          () =>
          (focused = false) => ({
            focused,
          }),
        onUpdateHasFocusedChild:
          () =>
          (hasFocusedChild = false) => ({
            hasFocusedChild,
          }),
      },
    ),

    /**
     * Propagate own 'focusKey' as a 'parentFocusKey' to it's children
     */
    withContext(
      {
        parentFocusKey: PropTypes.string,
      },
      ({ realFocusKey }) => ({
        parentFocusKey: realFocusKey,
      }),
    ),

    handlers,

    lifecycle({
      componentDidMount() {
        const {
          autoRestoreFocus,
          blockNavigationOut,
          focusable = true,
          forgetLastFocusedChild,
          onArrowPressHandler,
          onBecameBlurredHandler,
          onBecameFocusedHandler,
          onEnterPressHandler,
          onEnterReleaseHandler,
          onUpdateFocus,
          onUpdateHasFocusedChild,
          parentFocusKey,
          preferredChildFocusKey,
          realFocusKey: focusKey,
          trackChildren,
        } = this.props as HocProps;

        const node = SpatialNavigation.isNativeMode() ? this : findDOMNode(this);

        SpatialNavigation.addFocusable({
          autoRestoreFocus: config.autoRestoreFocus || autoRestoreFocus,
          blockNavigationOut: config.blockNavigationOut || blockNavigationOut,
          focusable,
          focusKey,
          forgetLastFocusedChild: config.forgetLastFocusedChild || forgetLastFocusedChild,
          node,
          onArrowPressHandler,
          onBecameBlurredHandler,
          onBecameFocusedHandler,
          onEnterPressHandler,
          onEnterReleaseHandler,
          onUpdateFocus,
          onUpdateHasFocusedChild,
          parentFocusKey,
          preferredChildFocusKey,
          trackChildren: config.trackChildren || trackChildren,
        });
      },
      componentDidUpdate() {
        const {
          blockNavigationOut = false,
          focusable = true,
          preferredChildFocusKey,
          realFocusKey: focusKey,
        } = this.props;

        const node = SpatialNavigation.isNativeMode() ? this : findDOMNode(this);

        SpatialNavigation.updateFocusable(focusKey, {
          blockNavigationOut: config.blockNavigationOut || blockNavigationOut,
          focusable,
          node,
          preferredChildFocusKey,
        });
      },
      componentWillUnmount() {
        const { realFocusKey: focusKey } = this.props;

        SpatialNavigation.removeFocusable({
          focusKey,
        });
      },
    }),

    pure,

    omitProps([
      'autoRestoreFocus',
      'forgetLastFocusedChild',
      'onArrowPressHandler',
      'onBecameBlurredHandler',
      'onBecameFocusedHandler',
      'onEnterPressHandler',
      'onEnterReleaseHandler',
      'onUpdateFocus',
      'onUpdateHasFocusedChild',
      'trackChildren',
    ]),
  );

  return MyComponent;
};

export default withFocusable;
