/**
 * FullscreenChartModal — presents a {@link NorthIndianChart} enlarged to fill
 * the screen, with an optional header (title/subtitle), a close button, and an
 * optional legend button. Pass chart data via `chartProps`, or supply your own
 * `children` to render anything else full-screen instead.
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { lightChartTheme, mergeTheme, type ChartTheme, type PartialChartTheme } from '../theme';
import { NorthIndianChart, type NorthIndianChartProps } from './NorthIndianChart';
import { ChartLegendBottomSheet } from './ChartLegendBottomSheet';

export interface FullscreenChartModalProps {
  visible: boolean;
  onClose: () => void;
  /**
   * Chart configuration. `size` is ignored — the modal sizes the chart to the
   * viewport. Omit when supplying custom `children`.
   */
  chartProps?: Omit<NorthIndianChartProps, 'size' | 'onPressInfo'>;
  /** Render custom content instead of a chart. */
  children?: React.ReactNode;
  theme?: ChartTheme | PartialChartTheme;
  title?: string;
  subtitle?: string;
  /** Show a legend button in the header. Default true when `chartProps` given. */
  showLegendButton?: boolean;
  /** Fraction of the smaller viewport dimension the chart should occupy. Default 0.9. */
  sizeRatio?: number;
  /** Accessibility label for the close button. Default "Close". */
  closeAccessibilityLabel?: string;
  testID?: string;
}

export function FullscreenChartModal(props: FullscreenChartModalProps) {
  const {
    visible,
    onClose,
    chartProps,
    children,
    theme: themeProp,
    title,
    subtitle,
    showLegendButton,
    sizeRatio = 0.9,
    closeAccessibilityLabel = 'Close',
    testID,
  } = props;

  const theme = isFullTheme(themeProp) ? themeProp : mergeTheme(themeProp, lightChartTheme);
  const c = theme.colors;
  const { width, height } = useWindowDimensions();
  const [legendVisible, setLegendVisible] = useState(false);

  const chartSize = Math.min(width, height) * clamp(sizeRatio, 0.3, 1);
  const legendEnabled = showLegendButton ?? Boolean(chartProps);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={[styles.root, { backgroundColor: c.background }]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? (
              <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text style={[styles.subtitle, { color: c.textSecondary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.headerActions}>
            {legendEnabled ? (
              <Pressable
                style={[styles.iconButton, { borderColor: c.border }]}
                onPress={() => setLegendVisible(true)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Show chart legend"
              >
                <Text style={[styles.iconGlyph, { color: c.accent }]}>i</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.iconButton, { borderColor: c.border }]}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={closeAccessibilityLabel}
            >
              <CloseIcon color={c.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          maximumZoomScale={3}
          minimumZoomScale={1}
          centerContent
        >
          {children ??
            (chartProps ? (
              <NorthIndianChart {...chartProps} size={chartSize} theme={theme} />
            ) : null)}
        </ScrollView>
      </View>

      {legendEnabled ? (
        <ChartLegendBottomSheet
          visible={legendVisible}
          onClose={() => setLegendVisible(false)}
          theme={theme}
          planetAbbreviations={chartProps?.planetAbbreviations}
        />
      ) : null}
    </Modal>
  );
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Line x1={3} y1={3} x2={15} y2={15} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={15} y1={3} x2={3} y2={15} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isFullTheme(theme: FullscreenChartModalProps['theme']): theme is ChartTheme {
  return (
    theme != null &&
    'colors' in theme &&
    'opacity' in theme &&
    'strokeWidth' in theme &&
    'fontSizes' in theme &&
    'lineHeights' in theme &&
    'fontWeights' in theme
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
