import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChargeList, type ChargeOriginLabel } from '@/src/components/ChargeList';
import { EventMap, type MapPin } from '@/src/components/EventMap';
import { Button, Chip, Segmented } from '@/src/components/ui';
import { EAT, PLAY, type LatLng, type PlaceType } from '@/src/data/mock';
import { openDirections } from '@/src/lib/maps';
import { useChargers } from '@/src/services/charging/useChargers';
import { usingSampleData } from '@/src/services/lodging';
import { useStays } from '@/src/services/lodging/useStays';
import { openEazyTab } from '@/src/services/ordering/eazytab';
import { useApp } from '@/src/state/AppState';
import { colors, radius, shadow } from '@/src/theme';

const TABS = ['Stay', 'Eat', 'Play', 'Charge'] as const;
type Tab = (typeof TABS)[number];
const TYPES: ('Any' | PlaceType)[] = ['Any', 'Hotel', 'Condo', 'Home', 'Apartment'];

const BADGE: Record<Exclude<Tab, 'Charge'>, { bg: string; fg: string }> = {
  Stay: { bg: colors.blueTint, fg: colors.navy },
  Eat: { bg: colors.orangeTint, fg: colors.orangeText },
  Play: { bg: '#EFE8FA', fg: '#4B2A86' },
};

type Row = {
  key: string;
  tag: string;
  name: string;
  note: string;
  drive: number;
  location?: LatLng;
  stayId?: string;
  eazytabVenueId?: string;
};

export default function EventScreen() {
  const params = useLocalSearchParams<{ id: string; tab?: string }>();
  const { findEvent, sport, org, orderedAt, markOrdered } = useApp();
  const event = findEvent(params.id);
  const [tab, setTab] = useState<Tab>((TABS as readonly string[]).includes(params.tab ?? '') ? (params.tab as Tab) : 'Stay');
  const [type, setType] = useState<'Any' | PlaceType>('Any');
  const [origin, setOrigin] = useState<ChargeOriginLabel>('Near the fields');
  const [fastOnly, setFastOnly] = useState(false);

  const lodging = useStays(
    event ? { eventId: event.id, venueName: `${sport.venue} for ${event.name}`, city: event.city, venue: event.venue } : null,
    type,
  );
  const charging = useChargers(event?.venue, origin === 'Near me' ? 'me' : 'venue', fastOnly, tab === 'Charge');

  const openStay = (stayId: string) => event && router.push({ pathname: '/stay/[id]', params: { id: stayId, eventId: event.id } });

  const rows: Row[] = useMemo(() => {
    if (tab === 'Charge') return [];
    if (tab === 'Stay')
      return lodging.stays.map((s) => ({
        key: s.id,
        tag: s.type.toUpperCase().slice(0, 5),
        name: s.name,
        note: `Sleeps ${s.sleeps} · ${s.pricePerNight}/night`,
        drive: s.driveMin,
        location: s.location,
        stayId: s.id,
      }));
    return (tab === 'Eat' ? EAT : PLAY).map((p) => ({ key: p.name, tag: p.tag, name: p.name, note: p.note, drive: p.driveMin, location: p.location, eazytabVenueId: p.eazytabVenueId }));
  }, [tab, lodging.stays]);

  const pins: MapPin[] = useMemo(() => {
    if (tab === 'Charge')
      return charging.chargers.map((c) => ({
        id: c.id,
        kind: 'charge' as const,
        title: c.name,
        subtitle: [c.fastPorts ? `${c.fastPorts} fast` : '', c.level2Ports ? `${c.level2Ports} Level 2` : ''].filter(Boolean).join(' · '),
        location: c.location,
        onPress: () => openDirections(c.name, c.location),
      }));
    const kind = tab === 'Stay' ? ('stay' as const) : tab === 'Eat' ? ('eat' as const) : ('play' as const);
    return rows
      .filter((r) => r.location)
      .map((r) => ({
        id: r.key,
        kind,
        title: r.name,
        subtitle: r.note,
        location: r.location!,
        onPress: r.stayId ? () => openStay(r.stayId!) : () => openDirections(r.name, r.location),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, rows, charging.chargers]);

  if (!event) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const captions: Record<Exclude<Tab, 'Charge'>, string> = {
    Stay: `Places to stay, closest to your ${sport.venue} first`,
    Eat: `Places to eat near your ${sport.venue} · Order ahead with EazyTab where you see Order`,
    Play: 'Fun between games',
  };
  const focus = tab === 'Charge' && origin === 'Near me' ? charging.near : null;

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

      <EventMap venue={event.venue} venueLabel={`Your ${sport.venue}`} pins={pins} focus={focus} />

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetBody}>
        <Segmented options={TABS} value={tab} onChange={setTab} />

        {tab === 'Charge' ? (
          <ChargeList
            venueLabel={sport.venue}
            origin={origin}
            onOrigin={setOrigin}
            fastOnly={fastOnly}
            onFastOnly={setFastOnly}
            chargers={charging.chargers}
            loading={charging.loading}
            error={charging.error}
            denied={charging.denied}
            retry={charging.retry}
          />
        ) : (
          <>
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
                onPress={() => (r.stayId ? openStay(r.stayId) : openDirections(`${r.name} near ${event.city}`, r.location))}
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
                      accessibilityLabel={`${orderedAt[r.eazytabVenueId] ? 'Buy again from' : 'Order from'} ${r.name} with EazyTab`}
                      onPress={() => {
                        const id = r.eazytabVenueId!;
                        openEazyTab(id, { eventId: event.id, again: !!orderedAt[id] });
                        markOrdered(id);
                      }}
                      style={styles.order}>
                      <Text style={styles.orderText}>{orderedAt[r.eazytabVenueId] ? 'Buy again' : 'Order'}</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            ))}
          </>
        )}
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
  sheet: { flex: 1, marginTop: -16, backgroundColor: colors.ground, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
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
