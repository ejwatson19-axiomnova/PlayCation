import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { useApp } from '@/src/state/AppState';
import { colors } from '@/src/theme';

type IconName = { ios: string; android: string; web: string };

function icon(name: IconName) {
  return ({ color }: { color: ColorValue }) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <SymbolView name={name as any} tintColor={color} size={24} />
  );
}

export default function TabLayout() {
  const { unread } = useApp();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: icon({ ios: 'magnifyingglass', android: 'search', web: 'search' }) }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips', tabBarIcon: icon({ ios: 'house', android: 'home', web: 'home' }) }} />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.alert },
          tabBarIcon: icon({ ios: 'bubble.left', android: 'chat', web: 'chat' }),
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon({ ios: 'person', android: 'person', web: 'person' }) }} />
    </Tabs>
  );
}
