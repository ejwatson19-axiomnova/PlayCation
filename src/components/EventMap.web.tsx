import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';

import type { MapPin, MapPinKind } from './EventMap';

export type { MapPin, MapPinKind } from './EventMap';

// The map library runs on iPhone and Android only. On the web preview, show a
// simple stand-in so every screen still works in a browser.
const LABEL: Record<MapPinKind, string> = { stay: 'stays', eat: 'places to eat', play: 'things to do', charge: 'chargers' };

export function EventMap({ venueLabel, pins, height = 240 }: { venueLabel: string; pins: MapPin[]; height?: number; [k: string]: unknown }) {
  const kind = pins[0]?.kind;
  return (
    <View style={[styles.box, { height }]} accessibilityLabel={`Map of ${venueLabel}`}>
      <View style={styles.ring} />
      <View style={styles.pin}>
        <Text style={styles.star}>★</Text>
      </View>
      <Text style={styles.label}>{venueLabel}</Text>
      <Text style={styles.note}>
        {kind ? `${pins.length} ${LABEL[kind]} on the map` : 'Map'} · open the app on a phone for the live map
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#E9EFE6', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.green, backgroundColor: 'rgba(46,158,62,0.08)' },
  pin: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navy, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  star: { color: colors.white, fontSize: 18 },
  label: { marginTop: 6, fontSize: 11, fontWeight: '700', color: colors.navy, backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  note: { position: 'absolute', bottom: 26, fontSize: 11, color: colors.muted },
});
