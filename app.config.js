// Extends app.json with the map plugin and reads Google Maps keys from the environment
// (see .env.example). Without keys: Expo Go works, iPhone uses Apple Maps, and Android
// store builds show a blank map until GOOGLE_MAPS_ANDROID_API_KEY is set.
module.exports = ({ config }) => {
  const android = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const ios = process.env.GOOGLE_MAPS_IOS_API_KEY;
  const maps = {};
  if (android) maps.androidGoogleMapsApiKey = android;
  if (ios) maps.iosGoogleMapsApiKey = ios;
  return { ...config, plugins: [...(config.plugins ?? []), ['react-native-maps', maps]] };
};
