import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Chip, Segmented } from '@/src/components/ui';
import { EAT, PLAY, type PlaceType } from '@/src/data/mock';
import { openDirections } from '@/src/lib/maps';
import { usingSampleData } from '@/src/services/lodging';
import { openEazyTab } from '@/src/services/ordering/eazytab';
import { useStays } from '@/src/services/lodging/useStays';
import { useApp } from '@/src/state/AppState';
import { colors, radius, shadow } from '@/src/theme';

const TABS = ['Stay', 'Eat', 'Play'] as const;
type Tab = (typeof TABS)[number];
const TYPES: ('Any' | PlaceType)[] = ['Any', 'Hotel', 'Condo', 'Home', 'Apartment'];

const BADGE: Record<Tab, { bg: string; fg: string }> = {
  Stay: { bg: colors.blueTint, fg: colors.navy },
  Eat: { bg: colors.orangeTint, fg: colors.orangeText },
  Play: { bg: colors.greenTint, fg: colors.greenDark },
};

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findEvent, sport, org } = useApp();
  const event = findEvent(id);
  const [tab, setTab] = useState<Tab>('Stay');
  const [type, setType] = useState<'Any' | PlaceType>('Any');
  const lodging = useStays(event ? { eventId: event.id, venueName: `${sport.venue} for ${event.name}`, city: event.city } : null, type);

  if (!event) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const rows =
    tab === 'Stay'
      ? lodging.stays.map((s) => ({ key: s.id, tag: s.type.toUpperCase().slice(0, 5), name: s.name, note: `Sleeps ${s.sleeps} · ${s.pricePerNight}/night`, drive: s.driveMin, stayId: s.id as string | undefined, eazytabVenueId: undefined as string | undefined }))
      : (tab === 'Eat' ? EAT : PLAY).map((p) => ({ key: p.name, tag: p.tag, name: p.name, note: p.note, drive: p.driveMin, stayId: undefined, eazytabVenueId: p.eazytabVenueId }));

  const captions: Record<Tab, string> = {
    Stay: `Places to stay, closest to your ${sport.venue} first`,
    Eat: `Places to eat near your ${sport.venue} · Order ahead with EazyTab where you see Order`,
    Play: 'Fun between games',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{event.name}</Text>
          <Text style={styles.sub}>
            {org} · {event.dates} · {event.city}
          </Text>
        </View>
      </View>

      {/* Placeholder until a maps provider is connected. */}
      <View style={styles.map} accessibilityLabel={`Map of stays near your ${sport.venue}`}>
        <View style={styles.ring} />
        <View style={styles.pin}>
          <Text style={styles.pinText}>★</Text>
        </View>
        <Text style={styles.pinLabel}>Your {sport.venue}</Text>
        <Text style={styles.ringLabel}>10 MIN DRIVE</Text>
      </View>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetBody}>
        <Segmented options={TABS} value={tab} onChange={setTab} />
        {tab === 'Stay' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {TYPES.map((t) => (
              <Chip key={t} label={t} selected={t === type} onPress={() => setType(t)} />
            ))}
          </ScrollView>
        )}
        <Text style={styles.caption}>
          {captions[tab]}
          {tab === 'Stay' && usingSampleData ? ' · sample listings' : ''}
        </Text>
        {tab === 'Stay' && lodging.loading && <ActivityIndicator color={colors.navy} style={{ marginTop: 12 }} />}
        {tab === 'Stay' && lodging.error && (
          <View style={{ gap: 8 }}>
            <Text style={styles.error}>{lodging.error}</Text>
            <Button label="Try again" variant="outline" onPress={lodging.retry} />
          </View>
        )}
        {!(tab === 'Stay' && (lodging.loading || lodging.error)) && rows.length === 0 && (
          <Text style={styles.caption}>No {type.toLowerCase()} stays for this event yet.</Text>
        )}
        {rows.map((r) => (
          <Pressable
            key={r.key}
            accessibilityRole="button"
            accessibilityHint={r.stayId ? 'Opens the listing' : 'Opens directions in your map app'}
            onPress={() =>
              r.stayId
                ? router.push({ pathname: '/stay/[id]', params: { id: r.stayId, eventId: event.id } })
                : openDirections(`${r.name} near ${event.city}`)
            }
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
            <View style={[styles.badge, { backgroundColor: BADGE[tab].bg }]}>
              <Text style={[styles.badgeText, { color: BADGE[tab].fg }]}>{r.tag}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{r.name}</Text>
              <Text style={styles.rowNote}>{r.note}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={styles.drive}>{r.drive === 0 ? 'At venue' : `${r.drive} min`}</Text>
              {r.eazytabVenueId && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Order from ${r.name} with EazyTab`}
                  onPress={() => openEazyTab(r.eazytabVenueId!, { eventId: event.id })}
                  style={styles.order}>
                  <Text style={styles.orderText}>Order</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  missing: { padding: 24, fontSize: 16, color: colors.ink },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: colors.navy, marginTop: -4 },
  title: { fontSize: 15, fontWeight: '700', color: colors.navy },
  sub: { fontSize: 12, color: colors.muted },
  map: { height: 210, backgroundColor: '#E9EFE6', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.green, backgroundColor: 'rgba(46,158,62,0.08)' },
  pin: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.navy, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  pinText: { color: colors.white, fontSize: 20 },
  pinLabel: { marginTop: 6, fontSize: 11, fontWeight: '700', color: colors.navy, backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  ringLabel: { position: 'absolute', top: 18, right: 40, fontSize: 10, fontWeight: '700', color: colors.greenDark, backgroundColor: colors.white, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  sheet: { flex: 1, marginTop: -18, backgroundColor: colors.ground, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetBody: { padding: 16, gap: 12, paddingBottom: 32 },
  caption: { fontSize: 12, color: colors.muted },
  error: { fontSize: 14, color: colors.alert },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, ...shadow },
  badge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  rowName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  rowNote: { fontSize: 12, color: colors.muted },
  drive: { fontSize: 12, fontWeight: '700', color: colors.greenText },
  order: { minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.orange, justifyContent: 'center' },
  orderText: { fontSize: 13, fontWeight: '700', color: colors.ink },
});
