import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow } from '@/src/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'navy' | 'outline' | 'outlineLight' | 'accent' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', style }: ButtonProps) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, v.box, pressed && { opacity: 0.85 }, style]}>
      <Text style={[styles.buttonText, v.text]}>{label}</Text>
    </Pressable>
  );
}

const buttonVariants = {
  primary: StyleSheet.create({ box: { backgroundColor: colors.green }, text: { color: colors.white } }),
  navy: StyleSheet.create({ box: { backgroundColor: colors.navy }, text: { color: colors.white } }),
  accent: StyleSheet.create({ box: { backgroundColor: colors.orange }, text: { color: colors.ink } }),
  outline: StyleSheet.create({ box: { borderWidth: 2, borderColor: colors.navy, backgroundColor: 'transparent' }, text: { color: colors.navy } }),
  outlineLight: StyleSheet.create({ box: { borderWidth: 2, borderColor: colors.white, backgroundColor: 'transparent' }, text: { color: colors.white } }),
  ghost: StyleSheet.create({ box: { backgroundColor: 'transparent' }, text: { color: colors.navy, fontSize: 14 } }),
};

type ChipProps = { label: string; selected: boolean; onPress: () => void; tone?: 'navy' | 'green' };

export function Chip({ label, selected, onPress, tone = 'navy' }: ChipProps) {
  const on = tone === 'green' ? { backgroundColor: colors.green, borderColor: colors.green } : { backgroundColor: colors.navy, borderColor: colors.navy };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? on : styles.chipOff]}>
      <Text style={[styles.chipText, { color: selected ? colors.white : tone === 'green' ? colors.greenDark : colors.navy }]}>{label}</Text>
    </Pressable>
  );
}

type SegmentedProps<T extends string> = { options: readonly T[]; value: T; onChange: (v: T) => void };

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View accessibilityRole="tablist" style={styles.segment}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o)}
            style={[styles.segmentItem, on && styles.segmentOn]}>
            <Text style={[styles.segmentText, { color: on ? colors.navy : colors.muted }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ label, tone = 'orange' }: { label: string; tone?: 'orange' | 'green' | 'blue' }) {
  const t = { orange: [colors.orange, colors.ink], green: [colors.greenTint, colors.greenDark], blue: [colors.blueTint, colors.navy] }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t[0] }]}>
      <Text style={[styles.badgeText, { color: t[1] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: { height: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, justifyContent: 'center' },
  chipOff: { backgroundColor: colors.white, borderColor: colors.border },
  chipText: { fontSize: 13, fontWeight: '600' },
  segment: { flexDirection: 'row', backgroundColor: colors.segment, padding: 4, borderRadius: radius.md, gap: 6 },
  segmentItem: { flex: 1, height: 42, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.white, ...shadow },
  segmentText: { fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, ...shadow },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});
