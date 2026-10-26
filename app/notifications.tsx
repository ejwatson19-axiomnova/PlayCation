import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Card } from '@/src/components/ui';
import { colors } from '@/src/theme';

const OPTIONS = [
  { key: 'messages', label: 'Messages from hosts', note: 'Replies, check-in details and door codes' },
  { key: 'schedule', label: 'Game time changes', note: 'When your organization updates the schedule' },
  { key: 'deals', label: 'Stays for upcoming events', note: 'Team rates near your next tournament' },
  { key: 'team', label: 'Team activity', note: 'When teammates book nearby' },
] as const;

export default function NotificationsScreen() {
  const [on, setOn] = useState<Record<string, boolean>>({ messages: true, schedule: true, deals: false, team: true });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Notifications" />
      <View style={styles.body}>
        <Card style={{ paddingVertical: 4 }}>
          {OPTIONS.map((o, i) => (
            <View key={o.key} style={[styles.row, i < OPTIONS.length - 1 && styles.line]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{o.label}</Text>
                <Text style={styles.note}>{o.note}</Text>
              </View>
              <Switch
                accessibilityLabel={o.label}
                value={on[o.key]}
                onValueChange={(v) => setOn({ ...on, [o.key]: v })}
                trackColor={{ true: colors.green, false: '#C7D0DC' }}
              />
            </View>
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: '#EEF1F5' },
  label: { fontSize: 15, color: colors.ink, fontWeight: '600' },
  note: { fontSize: 12, color: colors.muted },
});
