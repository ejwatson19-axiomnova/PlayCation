import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui';
import { colors } from '@/src/theme';

const BENEFITS = ["Find your tournament's fields", 'Hotels, condos and homes nearby', "Book with your team's families"];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <Image source={require('@/assets/images/logo.jpg')} style={styles.logo} resizeMode="contain" accessibilityLabel="Playcation" />
        <Text style={styles.tagline}>Stay close to the field.{'\n'}Book where your team plays.</Text>
      </View>

      <View style={styles.panel}>
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefit}>
            <View style={styles.dot} />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
        <Button label="Get started" variant="accent" onPress={() => router.push('/login?mode=signup')} style={{ marginTop: 8 }} />
        <Button label="Log in" variant="outlineLight" onPress={() => router.push('/login')} />
        <Pressable accessibilityRole="link" onPress={() => {}}>
          <Text style={styles.host}>Own a rental near the fields? List your place</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 18 },
  logo: { width: '90%', aspectRatio: 828 / 410 },
  tagline: { textAlign: 'center', fontSize: 17, fontWeight: '600', color: colors.navy, lineHeight: 24 },
  panel: { backgroundColor: colors.navy, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, gap: 12 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.green },
  benefitText: { color: colors.white, fontSize: 15 },
  host: { color: colors.white, textAlign: 'center', textDecorationLine: 'underline', fontSize: 13, paddingVertical: 8 },
});
