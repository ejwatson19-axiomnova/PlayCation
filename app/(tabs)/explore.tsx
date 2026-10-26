import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/src/components/ui';
import { SPORTS } from '@/src/data/mock';
import { useApp } from '@/src/state/AppState';
import { colors, radius, shadow } from '@/src/theme';

function Step({ n, label }: { n: number; label: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const { sport, org, setSport, setOrg, events } = useApp();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.pad}>
          <Image source={require('@/assets/images/logo.jpg')} style={styles.logo} resizeMode="contain" accessibilityLabel="Playcation" />
          <Text style={styles.h1}>
            Where's the <Text style={{ color: colors.greenText }}>big game?</Text>
          </Text>
          <TextInput
            accessibilityLabel="Search"
            placeholder="Search a tournament, field or city"
            placeholderTextColor="#8A97AB"
            style={styles.search}
          />
        </View>

        <View style={{ gap: 8 }}>
          <View style={styles.pad}>
            <Step n={1} label="Pick a sport" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {SPORTS.map((s) => (
              <Chip key={s.name} label={s.name} selected={s.name === sport.name} onPress={() => setSport(s.name)} />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.pad, { gap: 8 }]}>
          <Step n={2} label="Pick the organization" />
          <View style={styles.wrap}>
            {sport.orgs.map((o) => (
              <Chip key={o} label={o} tone="green" selected={o === org} onPress={() => setOrg(o)} />
            ))}
          </View>
        </View>

        <View style={[styles.pad, { gap: 10 }]}>
          <Step n={3} label="Choose your event" />
          {events.map((e) => (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: e.id } })}
              style={({ pressed }) => [styles.event, pressed && { opacity: 0.85 }]}>
              <View style={styles.date}>
                <Text style={styles.month}>{e.month}</Text>
                <Text style={styles.day}>{e.day}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventName}>{e.name}</Text>
                <Text style={styles.eventSub}>
                  {org} · {e.city} · {e.staysNearby} stays nearby
                </Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { paddingVertical: 16, gap: 20 },
  pad: { paddingHorizontal: 20, gap: 10 },
  logo: { width: 110, height: 55 },
  h1: { fontSize: 25, fontWeight: '800', color: colors.navy },
  search: { height: 52, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 16, fontSize: 15, color: colors.ink },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 14, fontWeight: '700', color: colors.navy },
  chipsRow: { paddingHorizontal: 20, gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  event: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, ...shadow },
  date: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  month: { fontSize: 10, fontWeight: '600', color: colors.orange },
  day: { fontSize: 17, fontWeight: '800', color: colors.white },
  eventName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  eventSub: { fontSize: 12, color: colors.muted },
  chev: { fontSize: 24, color: colors.muted },
});
