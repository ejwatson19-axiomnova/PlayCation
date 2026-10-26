import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Button } from '@/src/components/ui';
import { useApp } from '@/src/state/AppState';
import { colors, radius } from '@/src/theme';

export default function ReviewScreen() {
  const { booking, submitReview } = useApp();
  const [stars, setStars] = useState(booking?.review?.stars ?? 0);
  const [text, setText] = useState(booking?.review?.text ?? '');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Leave a review" />
        <Text style={[styles.p, { padding: 24 }]}>You can review a stay after you check out.</Text>
      </SafeAreaView>
    );
  }

  const submit = () => {
    if (stars === 0) {
      setError('Tap the stars to rate your stay.');
      return;
    }
    submitReview(stars, text.trim());
    setDone(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Leave a review" subtitle={booking.stay.name} />
      <View style={styles.body}>
        {done ? (
          <>
            <Text style={styles.h1}>Thanks for your review</Text>
            <Text style={styles.p}>It helps other team families pick a great place near the field.</Text>
            <Button label="Back to my trip" onPress={() => router.replace('/trips')} />
          </>
        ) : (
          <>
            <Text style={styles.label}>How was your stay?</Text>
            <View style={styles.stars} accessibilityRole="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="radio"
                  accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
                  accessibilityState={{ checked: stars === n }}
                  onPress={() => {
                    setStars(n);
                    setError('');
                  }}
                  style={styles.starBtn}>
                  <Text style={[styles.star, n <= stars && { color: colors.orange }]}>★</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Tell other families (optional)</Text>
            <TextInput
              accessibilityLabel="Review"
              value={text}
              onChangeText={setText}
              placeholder="Close to the fields, plenty of room for the team…"
              placeholderTextColor="#8A97AB"
              multiline
              style={styles.input}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Submit review" onPress={submit} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  body: { padding: 24, gap: 14 },
  h1: { fontSize: 22, fontWeight: '800', color: colors.navy },
  p: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '700', color: colors.navy },
  stars: { flexDirection: 'row', gap: 4 },
  starBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  star: { fontSize: 36, color: '#C7D0DC' },
  input: { minHeight: 110, borderRadius: radius.md, borderWidth: 1, borderColor: '#C7D0DC', padding: 14, fontSize: 15, color: colors.ink, textAlignVertical: 'top' },
  error: { fontSize: 13, color: colors.alert },
});
