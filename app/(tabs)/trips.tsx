import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card } from '@/src/components/ui';
import { GAME_TIMES } from '@/src/data/mock';
import { openDirections } from '@/src/lib/maps';
import { useApp } from '@/src/state/AppState';
import { colors, radius } from '@/src/theme';

export default function TripsScreen() {
  const { booking } = useApp();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.h1}>My trips</Text>

        {!booking ? (
          <Card style={{ gap: 12 }}>
            <Text style={styles.h2}>No trips yet</Text>
            <Text style={styles.sub}>Pick your tournament and book a stay close to the field.</Text>
            <Button label="Find a stay" onPress={() => router.replace('/explore')} />
          </Card>
        ) : (
          <>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <View style={styles.photo}>
                <Badge label={booking.checkedOut ? 'CHECKED OUT' : 'UPCOMING'} tone={booking.checkedOut ? 'green' : 'orange'} />
              </View>
              <View style={{ padding: 16, gap: 12 }}>
                <View>
                  <Text style={styles.h2}>{booking.stay.name}</Text>
                  <Text style={styles.sub}>For {booking.event.name}</Text>
                </View>
                <View style={styles.grid}>
                  <Info label="Check-in" value="Fri, 1 PM" />
                  <Info label="Check-out" value="Sun, 11 AM" />
                  <Info label="Door code" value="Sent Fri morning" />
                  <Info label={`To your ${booking.sport.venue}`} value={`${booking.stay.driveMin} min drive`} green />
                </View>
                <View style={styles.actions}>
                  <Button label="Message host" variant="navy" onPress={() => router.push('/messages')} style={{ flex: 1 }} />
                  <Button label="Directions" variant="outline" onPress={() => openDirections(booking.stay.name)} style={{ flex: 1 }} />
                </View>
                {booking.checkedOut && (
                  <Button label={booking.review ? 'Edit your review' : 'Leave a review'} variant="accent" onPress={() => router.push('/review')} />
                )}
              </View>
            </Card>

            <Text style={styles.h3}>Game times</Text>
            <Card style={{ paddingVertical: 4 }}>
              {GAME_TIMES.map((g, i) => (
                <View key={g.when} style={[styles.game, i < GAME_TIMES.length - 1 && styles.gameLine]}>
                  <Text style={styles.gameWhen}>{g.when}</Text>
                  <Text style={styles.sub}>
                    {g.where} · {booking.sport.unit} {g.unitNo}
                  </Text>
                </View>
              ))}
            </Card>
            <Text style={styles.sub}>Synced from {booking.org}. Times update automatically.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, green && { color: colors.greenText }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { padding: 20, gap: 16 },
  h1: { fontSize: 25, fontWeight: '800', color: colors.navy },
  h2: { fontSize: 17, fontWeight: '800', color: colors.navy },
  h3: { fontSize: 16, fontWeight: '700', color: colors.navy },
  sub: { fontSize: 13, color: colors.muted },
  photo: { height: 110, backgroundColor: colors.green, padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  info: { width: '48%', backgroundColor: colors.ground, borderRadius: radius.md, padding: 10 },
  infoLabel: { fontSize: 11, color: colors.muted },
  infoValue: { fontSize: 14, fontWeight: '700', color: colors.ink },
  actions: { flexDirection: 'row', gap: 10 },
  game: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  gameLine: { borderBottomWidth: 1, borderBottomColor: '#EEF1F5' },
  gameWhen: { fontSize: 14, color: colors.ink },
});
