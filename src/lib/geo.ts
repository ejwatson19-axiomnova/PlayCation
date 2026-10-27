import * as Location from 'expo-location';

import type { LatLng } from '@/src/data/mock';

/** Straight-line distance in miles (haversine). */
export function milesBetween(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const formatMiles = (mi: number) => (mi < 0.1 ? 'Under 0.1 mi' : `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`);

export class LocationDenied extends Error {
  constructor() {
    super('Location is off for Playcation. Turn it on in Settings to find chargers near you.');
    this.name = 'LocationDenied';
  }
}

/**
 * Asks for "while using the app" location (once), then returns the phone's GPS position.
 * Uses a recent cached fix when one exists so the screen responds quickly.
 */
export async function getCurrentLocation(): Promise<LatLng> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new LocationDenied();
  const recent = await Location.getLastKnownPositionAsync({ maxAge: 2 * 60 * 1000, requiredAccuracy: 200 });
  const pos = recent ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}
