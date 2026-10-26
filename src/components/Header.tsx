import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';

// Top bar for pushed screens: back button + title.
export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const back = () => (router.canGoBack() ? router.back() : router.replace('/explore'));
  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.back}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: '#E3E8EF' },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: colors.navy, marginTop: -4 },
  title: { fontSize: 17, fontWeight: '800', color: colors.navy },
  sub: { fontSize: 12, color: colors.muted },
});
