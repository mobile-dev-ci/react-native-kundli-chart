/**
 * A minimal, dependency-free bottom sheet built on React Native primitives
 * (Modal + Animated + PanResponder). Slides up from the bottom, dims the
 * backdrop, and dismisses on backdrop tap or swipe-down.
 *
 * It is intentionally small; if your app already uses `@gorhom/bottom-sheet`
 * you can ignore this and render {@link ChartLegendBottomSheet}'s content
 * inside your own sheet instead.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Sheet surface colour. */
  backgroundColor?: string;
  /** Grabber handle colour. */
  handleColor?: string;
  /** Backdrop opacity at rest (0-1). Default 0.5. */
  backdropOpacity?: number;
  /** Max sheet height as a fraction of the modal height (0-1). Default 0.85. */
  maxHeightRatio?: number;
  /** Disable swipe-to-dismiss. Default false. */
  disableSwipeToClose?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const OPEN_DURATION = 260;
const CLOSE_DURATION = 200;
const SWIPE_CLOSE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export function BottomSheet(props: BottomSheetProps) {
  const {
    visible,
    onClose,
    children,
    backgroundColor = '#FFFFFF',
    handleColor = '#C9C7D6',
    backdropOpacity = 0.5,
    maxHeightRatio = 0.85,
    disableSwipeToClose = false,
    style,
    testID,
  } = props;

  // Whether the Modal is mounted. Kept true during the exit animation.
  const [mounted, setMounted] = React.useState(visible);
  const [sheetHeight, setSheetHeight] = React.useState(0);

  const translateY = useRef(new Animated.Value(0)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdrop]);

  const animateOut = useCallback(
    (afterClose?: () => void) => {
      const distance = sheetHeight > 0 ? sheetHeight : 400;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: distance,
          duration: CLOSE_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: CLOSE_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
          afterClose?.();
        }
      });
    },
    [translateY, backdrop, sheetHeight],
  );

  // Open: mount then animate in.
  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else if (mounted) {
      animateOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Once mounted (and measured), slide in.
  useEffect(() => {
    if (mounted && visible) {
      translateY.setValue(sheetHeight > 0 ? sheetHeight : 400);
      animateIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, sheetHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        !disableSwipeToClose && gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_evt, gesture) => {
        const shouldClose =
          gesture.dy > SWIPE_CLOSE_THRESHOLD || gesture.vy > SWIPE_VELOCITY_THRESHOLD;
        if (shouldClose) {
          animateOut(onClose);
        } else {
          Animated.timing(translateY, {
            toValue: 0,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const requestClose = useCallback(() => animateOut(onClose), [animateOut, onClose]);

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={requestClose}
      testID={testID}
    >
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdrop.interpolate({
                inputRange: [0, 1],
                outputRange: [0, backdropOpacity],
              }),
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={requestClose}
            accessibilityLabel="Close"
          />
        </Animated.View>

        <Animated.View
          onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
          style={[
            styles.sheet,
            {
              backgroundColor,
              maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
              transform: [{ translateY }],
            },
            style,
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
