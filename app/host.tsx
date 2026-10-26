import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Button, Chip } from '@/src/components/ui';
import type { PlaceType } from '@/src/data/mock';
import { colors, radius } from '@/src/theme';

const TYPES: PlaceType[] = ['Home', 'Condo', 'Apartment', 'Hotel'];
const PERKS = ['Parking for 2+ cars', 'Washer and dryer', 'Full kitchen', 'Gear storage', 'Early check-in', 'Yard or patio'];

// Collects a host's listing request. Not sent anywhere until a backend exists.
export default function HostScreen() {
  const [type, setType] = useState<PlaceType>('Home');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [complex, setComplex] = useState('');
  const [bedrooms, setBedrooms] = useState(3);
  const [perks, setPerks] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!name.trim() || !address.trim()) {
      setError('Add your property name and address.');
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="List your place" />
        <View style={styles.body}>
          <Text style={styles.h1}>Thanks! We got your listing</Text>
          <Text style={styles.p}>
            Our team will review {name.trim()} and email you within 2 business days to finish setup, photos and pricing.
          </Text>
          <Button label="Done" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="List your place" subtitle="Host families traveling for tournaments" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Property type</Text>
        <View style={styles.wrap}>
          {TYPES.map((t) => (
            <Chip key={t} label={t} selected={t === type} onPress={() => setType(t)} />
          ))}
        </View>

        <Field label="Property name" value={name} onChange={(t) => { setName(t); setError(''); }} placeholder="Lakeview 4BR home" />
        <Field label="Address" value={address} onChange={(t) => { setAddress(t); setError(''); }} placeholder="123 Main St, City, ST" />
        <Field label="Nearest sports complex (optional)" value={complex} onChange={setComplex} placeholder="Riverside Sports Park" />

        <Text style={styles.label}>Bedrooms</Text>
        <View style={styles.stepper}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fewer bedrooms" onPress={() => setBedrooms(Math.max(1, bedrooms - 1))} style={styles.stepBtn}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{bedrooms}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="More bedrooms" onPress={() => setBedrooms(Math.min(12, bedrooms + 1))} style={styles.stepBtn}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Good for game weekends</Text>
        <View style={styles.wrap}>
          {PERKS.map((p) => (
            <Chip
              key={p}
              label={p}
              tone="green"
              selected={perks.includes(p)}
              onPress={() => setPerks(perks.includes(p) ? perks.filter((x) => x !== p) : [...perks, p])}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Submit listing" onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (t: string) => void; placeholder: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#8A97AB" style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  body: { padding: 20, gap: 14, paddingBottom: 40 },
  h1: { fontSize: 22, fontWeight: '800', color: colors.navy },
  p: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', color: colors.navy },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { height: 50, borderRadius: radius.md, borderWidth: 1, borderColor: '#C7D0DC', paddingHorizontal: 16, fontSize: 15, color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 22, color: colors.navy },
  stepValue: { fontSize: 18, fontWeight: '700', color: colors.ink, minWidth: 24, textAlign: 'center' },
  error: { fontSize: 13, color: colors.alert },
});
