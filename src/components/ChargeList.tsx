import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Chip, Segmented } from '@/src/components/ui';
import { formatMiles } from '@/src/lib/geo';
import { openDirections } from '@/src/lib/maps';
import { chargingUsesSampleData, type Charger } from '@/src/services/charging';
import { colors, radius, shadow } from '@/src/theme';

export const CHARGE_ORIGINS = ['Near the fields', 'Near me'] as const;
export type ChargeOriginLabel = (typeof CHARGE_ORIGINS)[number];

type Props = {
  venueLabel: string;
  origin: ChargeOriginLabel;
  onOrigin: (o: ChargeOriginLabel) => void;
  fastOnly: boolean;
  onFastOnly: (v: boolean) => void;
  chargers: Charger[];
  loading: boolean;
  error: string | null;
  denied: boolean;
  retry: () => void;
};

/** Public EV chargers near the venue or near the family's GPS position (same results as the map). */
export function ChargeList({ venueLabel, origin, onOrigin, fastOnly, onFastOnly, chargers, loading, error, denied, retry }: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Segmented options={CHARGE_ORIGINS} value={origin} onChange={onOrigin} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="All chargers" selected={!fastOnly} onPress={() => onFastOnly(false)} tone="green" />
        <Chip label="Fast charging only" selected={fastOnly} onPress={() => onFastOnly(true)} tone="green" />
      </View>
      <Text style={styles.caption}>
        {origin === 'Near me' ? 'Closest to you, using your phone’s location' : `Closest to your ${venueLabel}`}
        {chargingUsesSampleData ? ' · sample stations' : ''}
      </Text>

      {loading && <ActivityIndicator color={colors.navy} style={{ marginTop: 12 }} />}
      {!loading && error && (
        <View style={{ gap: 8 }}>
          <Text style={styles.error}>{error}</Text>
          {denied ? (
            <Button label="Open Settings" variant="outline" onPress={() => Linking.openSettings().catch(() => {})} />
          ) : (
            <Button label="Try again" variant="outline" onPress={retry} />
          )}
        </View>
      )}
      {!loading && !error && chargers.length === 0 && <Text style={styles.caption}>No {fastOnly ? 'fast ' : ''}chargers found nearby.</Text>}

      {!loading &&
        !error &&
        chargers.map((c) => {
          const ports = [c.fastPorts ? `${c.fastPorts} fast` : '', c.level2Ports ? `${c.level2Ports} Level 2` : ''].filter(Boolean).join(' · ');
          const fast = c.fastPorts > 0;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityHint="Opens directions in your map app"
              onPress={() => openDirections(c.name, c.location)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
              <View style={[styles.badge, fast ? styles.badgeFast : styles.badgeL2]}>
                <Text style={[styles.badgeText, { color: fast ? colors.white : colors.navy }]}>{fast ? 'FAST' : 'L2'}</Text>
                {c.maxPowerKw ? <Text style={[styles.kw, { color: fast ? colors.white : colors.navy }]}>{Math.round(c.maxPowerKw)} kW</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.note}>{[c.network, ports].filter(Boolean).join(' · ')}</Text>
                {c.connectors.length > 0 && <Text style={styles.note}>Plugs: {c.connectors.join(', ')}</Text>}
                {c.cost ? <Text style={styles.note}>{c.cost}</Text> : null}
                {c.available === false && <Text style={styles.down}>Reported out of service</Text>}
              </View>
              <Text style={styles.miles}>{formatMiles(c.miles)}</Text>
            </Pressable>
          );
        })}
      {!loading && !error && chargers.length > 0 && <Text style={styles.caption}>Tap a station for directions. Distances are straight-line.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: 12, color: colors.muted },
  error: { fontSize: 14, color: colors.alert },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, ...shadow },
  badge: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeFast: { backgroundColor: colors.green },
  badgeL2: { backgroundColor: colors.blueTint },
  badgeText: { fontSize: 11, fontWeight: '800' },
  kw: { fontSize: 10, fontWeight: '600' },
  name: { fontSize: 14, fontWeight: '600', color: colors.ink },
  note: { fontSize: 12, color: colors.muted },
  down: { fontSize: 12, fontWeight: '600', color: colors.alert },
  miles: { fontSize: 12, fontWeight: '700', color: colors.greenText },
});
