import { Linking, Platform } from 'react-native';

// Opens the phone's map app searching for a place (Apple Maps on iPhone, Google Maps elsewhere).
// Once real listings have addresses, pass the address instead of the name.
export function openDirections(query: string) {
  const q = encodeURIComponent(query);
  const url = Platform.OS === 'ios' ? `http://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
  Linking.openURL(url).catch(() => {});
}
