import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button } from '@/src/components/ui';
import { useApp } from '@/src/state/AppState';
import { colors, radius } from '@/src/theme';

export default function StayScreen() {
  const { id, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const { findStay, findEvent, book, sport } = useApp();
  const stay = findStay(id);
  const event = findEvent(eventId);
  const [saved, setSaved] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [split, setSplit] = useState(false);
  const [booked, setBooked] = useState(false);

  if (!stay || !event) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ padding: 24 }}>Listing not found.</Text>
      </SafeAreaView>
    );
  }

  const confirm = () => {
    book(stay, event, split);
    setBooked(true);
  };

  const go = (path: '/trips' | '/messages') => {
    setSheet(false);
    router.replace(path);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Photo placeholder: hosts upload real photos here. */}
      <View style={styles.photo} accessibilityLabel={`Photo of ${stay.name}`}>
        <Text style={styles.photoText}>[Listing photos]</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={[styles.round, { left: 16 }]}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved' : 'Save'}
          onPress={() => setSaved(!saved)}
          style={[styles.round, { right: 16 }]}>
          <Text style={[styles.heart, saved && { color: colors.orange }]}>{saved ? '♥' : '♡'}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.sheetTop} contentContainerStyle={styles.body}>
        <Badge label={stay.type === 'Hotel' ? 'HOTEL' : `ENTIRE ${stay.type.toUpperCase()}`} tone="blue" />
        <Text style={styles.h1}>{stay.name}</Text>
        <Text style={styles.sub}>
          {stay.summary} · sleeps {stay.sleeps}
        </Text>

        <View style={styles.drive}>
          <Text style={styles.driveBig}>
            {stay.driveMin} min to your {sport.venue}
          </Text>
          <Text style={styles.driveSmall}>{stay.miles} miles · grocery 3 min away</Text>
        </View>

        <Text style={styles.h2}>Good for game weekends</Text>
        <View style={styles.perks}>
          {stay.perks.map((p) => (
            <Text key={p} style={styles.perk}>
              ✓ {p}
            </Text>
          ))}
        </View>
        <Text style={styles.sub}>Free cancellation if the tournament is canceled.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.price}>
            {stay.pricePerNight} <Text style={styles.sub}>night</Text>
          </Text>
          <Text style={styles.sub}>{event.dates}</Text>
        </View>
        <Button label="Reserve" onPress={() => setSheet(true)} style={{ paddingHorizontal: 28 }} />
      </View>

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <View style={styles.scrim}>
          <View style={styles.modal}>
            {!booked ? (
              <>
                <View style={styles.modalHead}>
                  <Text style={styles.modalTitle}>Confirm your stay</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setSheet(false)} style={styles.close}>
                    <Text style={styles.closeText}>✕</Text>
                  </Pressable>
                </View>
                <View style={styles.grid}>
                  <View style={styles.box}>
                    <Text style={styles.boxLabel}>Dates</Text>
                    <Text style={styles.boxValue}>{event.dates}</Text>
                  </View>
                  <View style={styles.box}>
                    <Text style={styles.boxLabel}>Guests</Text>
                    <Text style={styles.boxValue}>{split ? '2 families' : '2 adults, 3 kids'}</Text>
                  </View>
                </View>
                <View style={styles.split}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.splitTitle}>Split with a team family</Text>
                    <Text style={styles.sub}>Invite another family to share the cost</Text>
                  </View>
                  <Switch
                    accessibilityLabel="Split with a team family"
                    value={split}
                    onValueChange={setSplit}
                    trackColor={{ true: colors.green, false: '#C7D0DC' }}
                  />
                </View>
                <View style={styles.total}>
                  <Text style={styles.totalText}>{split ? 'Your share (2 nights)' : 'Total (2 nights)'}</Text>
                  <Text style={[styles.totalText, { color: colors.navy }]}>[$0,000]</Text>
                </View>
                <Button label="Book now" onPress={confirm} />
              </>
            ) : (
              <View style={styles.done}>
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <Text style={styles.modalTitle}>You're booked!</Text>
                <Text style={[styles.sub, { textAlign: 'center' }]}>
                  {stay.name} · {event.dates}. Your host will send check-in details.
                </Text>
                <Button label="View my trip" variant="navy" onPress={() => go('/trips')} style={{ alignSelf: 'stretch' }} />
                <Button label="Message host" variant="outline" onPress={() => go('/messages')} style={{ alignSelf: 'stretch' }} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  photo: { height: 230, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  photoText: { color: colors.white, fontWeight: '600' },
  round: { position: 'absolute', top: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: colors.navy, marginTop: -4 },
  heart: { fontSize: 22, color: colors.navy },
  sheetTop: { flex: 1, marginTop: -18, backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  body: { padding: 20, gap: 12 },
  h1: { fontSize: 21, fontWeight: '800', color: colors.navy },
  h2: { fontSize: 16, fontWeight: '700', color: colors.navy },
  sub: { fontSize: 13, color: colors.muted },
  drive: { backgroundColor: colors.greenTint, borderRadius: radius.lg, padding: 14 },
  driveBig: { fontSize: 16, fontWeight: '800', color: colors.greenDark },
  driveSmall: { fontSize: 12, color: colors.greenDark },
  perks: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  perk: { width: '50%', fontSize: 13, color: colors.ink },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#E3E8EF' },
  price: { fontSize: 16, fontWeight: '800', color: colors.navy },
  scrim: { flex: 1, backgroundColor: 'rgba(14,27,51,0.45)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, gap: 14 },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.navy },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, color: colors.navy },
  grid: { flexDirection: 'row', gap: 10 },
  box: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12 },
  boxLabel: { fontSize: 11, color: colors.muted },
  boxValue: { fontSize: 14, fontWeight: '600', color: colors.ink },
  split: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.ground, borderRadius: radius.md, padding: 12 },
  splitTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  total: { flexDirection: 'row', justifyContent: 'space-between' },
  totalText: { fontSize: 16, fontWeight: '800', color: colors.ink },
  done: { alignItems: 'center', gap: 12 },
  check: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontSize: 30, color: colors.greenText, fontWeight: '800' },
});
