import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, type Region } from 'react-native-maps';

import type { LatLng } from '@/src/data/mock';
import { getCurrentLocation } from '@/src/lib/geo';
import { colors } from '@/src/theme';

export type MapPinKind = 'stay' | 'eat' | 'play' | 'charge';

export type MapPin = {
  id: string;
  kind: MapPinKind;
  title: string;
  subtitle?: string;
  location: LatLng;
  /** Tapping the pin's label bubble (open the listing, start directions…). */
  onPress?: () => void;
};

export const PIN_COLORS: Record<MapPinKind, string> = {
  stay: colors.navy,
  eat: colors.orange,
  play: '#7B4FC4',
  charge: colors.green,
};

type Props = {
  venue: LatLng;
  venueLabel: string;
  pins: MapPin[];
  /** Shaded circle around the venue, in meters (about a 10-minute drive). */
  radiusMeters?: number;
  /** Re-centers the map here (e.g. the family's position for "Near me"). */
  focus?: LatLng | null;
  height?: number;
};

function regionFor(points: LatLng[], center: LatLng): Region {
  const spread = points.reduce((m, p) => Math.max(m, Math.abs(p.lat - center.lat), Math.abs(p.lng - center.lng)), 0);
  const delta = Math.max(0.03, spread * 2.6);
  return { latitude: center.lat, longitude: center.lng, latitudeDelta: delta, longitudeDelta: delta };
}

/**
 * Interactive map: Google Maps on Android, Apple Maps on iPhone.
 * Shows the venue, a drive-time circle, and pins for the current tab.
 */
export function EventMap({ venue, venueLabel, pins, radiusMeters = 6400, focus, height = 240 }: Props) {
  const ref = useRef<MapView>(null);
  const [showMe, setShowMe] = useState(false);
  const center = focus ?? venue;
  const region = useMemo(() => regionFor([venue, ...pins.map((p) => p.location)], center), [venue, pins, center]);

  // Show the blue "you are here" dot only if location was already allowed; never prompt on open.
  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then((p) => setShowMe(p.status === 'granted'))
      .catch(() => {});
  }, [focus]);

  useEffect(() => {
    ref.current?.animateToRegion(region, 400);
  }, [region]);

  const goToMe = async () => {
    try {
      const me = await getCurrentLocation();
      setShowMe(true);
      ref.current?.animateToRegion({ latitude: me.lat, longitude: me.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 400);
    } catch {
      // Permission denied or no fix: stay on the venue.
    }
  };

  return (
    <View style={{ height }}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation={showMe}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
        accessibilityLabel={`Map of ${venueLabel} and nearby places`}>
        <Circle
          center={{ latitude: venue.lat, longitude: venue.lng }}
          radius={radiusMeters}
          strokeColor="rgba(46,158,62,0.7)"
          fillColor="rgba(46,158,62,0.08)"
          strokeWidth={2}
        />
        <Marker coordinate={{ latitude: venue.lat, longitude: venue.lng }} title={venueLabel} anchor={{ x: 0.5, y: 0.5 }} zIndex={10}>
          <View style={styles.venue}>
            <Text style={styles.venueText}>★</Text>
          </View>
        </Marker>
        {pins.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.location.lat, longitude: p.location.lng }}
            title={p.title}
            description={p.subtitle ? `${p.subtitle}${p.onPress ? ' · tap for more' : ''}` : p.onPress ? 'Tap for more' : undefined}
            pinColor={PIN_COLORS[p.kind]}
            onCalloutPress={p.onPress}
          />
        ))}
      </MapView>
      <Pressable accessibilityRole="button" accessibilityLabel="Show my location" onPress={goToMe} style={styles.meBtn}>
        <Text style={styles.meText}>◎</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  venue: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.navy, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  venueText: { color: colors.white, fontSize: 17 },
  meBtn: {
    position: 'absolute',
    right: 12,
    bottom: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  meText: { fontSize: 22, color: colors.navy },
});
