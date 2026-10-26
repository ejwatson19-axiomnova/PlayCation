import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Button, Card } from '@/src/components/ui';
import { colors } from '@/src/theme';

// TODO: replace with Playcation's real support address.
const SUPPORT_EMAIL = 'support@example.com';

const FAQ = [
  { q: 'What if the tournament is canceled?', a: 'Stays marked "free cancellation if the event is canceled" are refunded in full when the organizer cancels.' },
  { q: 'How does splitting with a team family work?', a: 'Turn on "Split with a team family" when you reserve. You invite another family, and each family pays its own share.' },
  { q: 'When do I get the door code?', a: 'Your host sends check-in details, including the door code, the morning of check-in in Messages.' },
  { q: 'How do I change my dates?', a: 'Message your host from the Trips tab. They can update your booking if the dates are free.' },
];

export default function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Help" />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={{ paddingVertical: 4 }}>
          {FAQ.map((f, i) => (
            <View key={f.q} style={[styles.item, i < FAQ.length - 1 && styles.line]}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open === i }}
                onPress={() => setOpen(open === i ? null : i)}
                style={styles.qRow}>
                <Text style={styles.q}>{f.q}</Text>
                <Text style={styles.toggle}>{open === i ? '−' : '+'}</Text>
              </Pressable>
              {open === i && <Text style={styles.a}>{f.a}</Text>}
            </View>
          ))}
        </Card>
        <Button label="Email support" variant="navy" onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Playcation%20help`).catch(() => {})} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { padding: 20, gap: 16 },
  item: { paddingVertical: 4 },
  line: { borderBottomWidth: 1, borderBottomColor: '#EEF1F5' },
  qRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 10 },
  q: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink },
  toggle: { fontSize: 22, color: colors.navy },
  a: { fontSize: 14, color: colors.muted, lineHeight: 20, paddingBottom: 12 },
});
