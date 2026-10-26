import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { searchEvents } from '@/src/data/mock';
import { useApp } from '@/src/state/AppState';
import { colors, radius, shadow } from '@/src/theme';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(params.q ?? '');
  const { selectEvent } = useApp();
  const hits = searchEvents(q);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Search" />
      <View style={{ padding: 16 }}>
        <TextInput
          accessibilityLabel="Search"
          autoFocus
          value={q}
          onChangeText={setQ}
          placeholder="Try baseball, Perfect Game or soccer"
          placeholderTextColor="#8A97AB"
          returnKeyType="search"
          style={styles.input}
        />
      </View>
      <FlatList
        data={hits}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
        ListEmptyComponent={
          <Text style={styles.empty}>{q.trim() ? `No events match "${q.trim()}".` : 'Search by sport, organization, tournament or city.'}</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              selectEvent(item.sport, item.org);
              router.push({ pathname: '/event/[id]', params: { id: item.id } });
            }}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
            <View style={styles.date}>
              <Text style={styles.month}>{item.month}</Text>
              <Text style={styles.day}>{item.day}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                {item.org} · {item.city}
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  input: { height: 50, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 16, fontSize: 15, color: colors.ink },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 24, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, ...shadow },
  date: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  month: { fontSize: 10, fontWeight: '600', color: colors.orange },
  day: { fontSize: 17, fontWeight: '800', color: colors.white },
  name: { fontSize: 14, fontWeight: '600', color: colors.ink },
  sub: { fontSize: 12, color: colors.muted },
  chev: { fontSize: 24, color: colors.muted },
});
