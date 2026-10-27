import { Linking, Platform } from 'react-native';

import type { LatLng } from '@/src/data/mock';

// Opens the phone's map app (Apple Maps on iPhone, Google Maps elsewhere).
// With coordinates it starts directions to that exact spot; otherwise it searches by name.
export function openDirections(query: string, to?: LatLng) {
  let url: string;
  if (to) {
    const dest = `${to.lat},${to.lng}`;
    url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${dest}&q=${encodeURIComponent(query)}`
        : `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  } else {
    const q = encodeURIComponent(query);
    url = Platform.OS === 'ios' ? `http://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
  Linking.openURL(url).catch(() => {});
}
