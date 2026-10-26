import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppStateProvider } from '@/src/state/AppState';
import { colors } from '@/src/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.ground, primary: colors.navy },
};

export default function RootLayout() {
  return (
    <AppStateProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="event/[id]" />
          <Stack.Screen name="stay/[id]" />
        </Stack>
      </ThemeProvider>
    </AppStateProvider>
  );
}
