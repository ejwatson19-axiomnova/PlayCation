import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card } from '@/src/components/ui';
import { CHECKOUT_TASKS } from '@/src/data/mock';
import { useApp, type Message } from '@/src/state/AppState';
import { colors, radius } from '@/src/theme';

const QUICK = ['Wi-Fi password?', 'Where do we park?', 'Late checkout Sunday?', 'Extra towels'];

export default function MessagesScreen() {
  const { booking, messages, sendMessage, checkOut, markRead } = useApp();
  const [draft, setDraft] = useState('');
  const [sheet, setSheet] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useFocusEffect(useCallback(() => markRead(), [markRead]));

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: 20, gap: 16 }}>
          <Text style={styles.h1}>Messages</Text>
          <Card style={{ gap: 12 }}>
            <Text style={styles.h2}>No messages yet</Text>
            <Text style={styles.sub}>Once you book a stay, you can message your host here.</Text>
            <Button label="Find a stay" onPress={() => router.replace('/explore')} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const send = (t: string) => {
    sendMessage(t);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>DK</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hostName}>[Host name]</Text>
            <Text style={styles.sub}>Property manager · replies in ~10 min</Text>
          </View>
        </View>

        <View style={styles.booking}>
          <View style={styles.bookingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingName}>{booking.stay.name}</Text>
              <Text style={styles.bookingSub}>{booking.event.dates} · Check-out Sun 11 AM</Text>
            </View>
            <Badge label={booking.checkedOut ? 'CHECKED OUT' : 'BOOKED'} tone={booking.checkedOut ? 'green' : 'orange'} />
          </View>
          {booking.checkedOut ? (
            <Button label="Leave a review" variant="outlineLight" onPress={() => {}} />
          ) : (
            <Button label="Check out" variant="accent" onPress={() => setSheet(true)} />
          )}
        </View>

        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <Bubble m={item} />}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.quick}>
          {QUICK.map((q) => (
            <Pressable key={q} accessibilityRole="button" onPress={() => send(q)} style={styles.quickChip}>
              <Text style={styles.quickText}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Message"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => send(draft)}
            placeholder="Message [Host name]…"
            placeholderTextColor="#8A97AB"
            returnKeyType="send"
            style={styles.input}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => send(draft)} style={styles.send}>
            <Text style={styles.sendText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <View style={styles.scrim}>
          <View style={styles.modal}>
            <Text style={styles.h2}>Ready to check out?</Text>
            <Text style={styles.sub}>Your host's quick checklist:</Text>
            {CHECKOUT_TASKS.map((t) => (
              <Pressable
                key={t}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: !!done[t] }}
                onPress={() => setDone({ ...done, [t]: !done[t] })}
                style={styles.task}>
                <View style={[styles.box, done[t] && styles.boxOn]}>{done[t] && <Text style={styles.tick}>✓</Text>}</View>
                <Text style={styles.taskText}>{t}</Text>
              </Pressable>
            ))}
            <Button
              label="Confirm check-out"
              onPress={() => {
                checkOut();
                setSheet(false);
              }}
            />
            <Button label="Not yet" variant="ghost" onPress={() => setSheet(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Bubble({ m }: { m: Message }) {
  if (m.from === 'system') {
    return (
      <View style={{ alignSelf: 'center', alignItems: 'center', gap: 3 }}>
        <Text style={styles.system}>{m.text}</Text>
      </View>
    );
  }
  const mine = m.from === 'me';
  return (
    <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '80%', gap: 3 }}>
      <Text style={[styles.bubble, mine ? styles.mine : styles.theirs]}>{m.text}</Text>
      <Text style={styles.meta}>{m.meta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  h1: { fontSize: 25, fontWeight: '800', color: colors.navy },
  h2: { fontSize: 19, fontWeight: '800', color: colors.navy },
  sub: { fontSize: 12, color: colors.muted },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, padding: 14, borderBottomWidth: 1, borderBottomColor: '#E3E8EF' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700' },
  hostName: { fontSize: 15, fontWeight: '700', color: colors.navy },
  booking: { margin: 12, marginBottom: 0, backgroundColor: colors.navy, borderRadius: radius.lg, padding: 12, gap: 10 },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bookingName: { color: colors.white, fontSize: 13, fontWeight: '700' },
  bookingSub: { color: colors.white, fontSize: 11 },
  list: { padding: 16, gap: 10 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, lineHeight: 20, overflow: 'hidden' },
  mine: { backgroundColor: colors.navy, color: colors.white, borderRadius: 18, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.white, color: colors.ink, borderRadius: 18, borderBottomLeftRadius: 4 },
  meta: { fontSize: 10, color: colors.muted, paddingHorizontal: 4 },
  system: { backgroundColor: colors.greenTint, color: colors.greenDark, fontSize: 13, fontWeight: '600', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, overflow: 'hidden' },
  quick: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  quickChip: { height: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, justifyContent: 'center' },
  quickText: { fontSize: 12, fontWeight: '600', color: colors.navy },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, padding: 10, borderTopWidth: 1, borderTopColor: '#E3E8EF' },
  input: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, fontSize: 14, color: colors.ink },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: colors.white, fontSize: 16 },
  scrim: { flex: 1, backgroundColor: 'rgba(14,27,51,0.45)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, gap: 12 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#8A97AB', alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.green, borderColor: colors.green },
  tick: { color: colors.white, fontWeight: '800' },
  taskText: { fontSize: 14, color: colors.ink },
});
