import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/src/components/ui';
import { colors } from '@/src/theme';

const ROWS = ['My teams', 'Payment methods', 'Notifications', 'Help', 'List your place'];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.body}>
        <Text style={styles.h1}>Profile</Text>
        <Card style={{ paddingVertical: 4 }}>
          {ROWS.map((r, i) => (
            <Pressable key={r} accessibilityRole="button" style={[styles.row, i < ROWS.length - 1 && styles.line]}>
              <Text style={styles.rowText}>{r}</Text>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
        </Card>
        <Button label="Log out" variant="outline" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { padding: 20, gap: 16 },
  h1: { fontSize: 25, fontWeight: '800', color: colors.navy },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 50 },
  line: { borderBottomWidth: 1, borderBottomColor: '#EEF1F5' },
  rowText: { fontSize: 15, color: colors.ink },
  chev: { fontSize: 22, color: colors.muted },
});
