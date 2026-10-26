import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Button, Card } from '@/src/components/ui';
import { colors } from '@/src/theme';

// Real cards are added through a payment provider (e.g. Stripe) once it's connected.
export default function PaymentsScreen() {
  const addCard = () =>
    Alert.alert('Coming soon', 'Adding a card will be available once Playcation connects its payment provider.');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Payment methods" />
      <View style={styles.body}>
        <Card style={{ gap: 8 }}>
          <Text style={styles.h2}>No payment methods yet</Text>
          <Text style={styles.sub}>Add a card to book stays faster. When you split a stay with a team family, each family pays its own share.</Text>
        </Card>
        <Button label="Add a card" onPress={addCard} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { padding: 20, gap: 16 },
  h2: { fontSize: 17, fontWeight: '800', color: colors.navy },
  sub: { fontSize: 14, color: colors.muted, lineHeight: 20 },
});
