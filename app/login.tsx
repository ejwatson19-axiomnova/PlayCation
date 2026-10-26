import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Segmented } from '@/src/components/ui';
import { colors, radius } from '@/src/theme';

const MODES = ['Log in', 'Sign up'] as const;
type Mode = (typeof MODES)[number];

// Authentication is not wired up yet; every path continues into the app.
export default function LoginScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'signup' ? 'Sign up' : 'Log in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const enter = () => router.replace('/explore');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Image source={require('@/assets/images/logo.jpg')} style={styles.logo} resizeMode="contain" accessibilityLabel="Playcation" />
          <Segmented options={MODES} value={mode} onChange={setMode} />

          {mode === 'Sign up' && <Field label="Your name" value={name} onChangeText={setName} placeholder="First and last name" />}
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Password" secure />
          {mode === 'Log in' && (
            <Pressable accessibilityRole="link" onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-end', paddingVertical: 8 }}>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>
          )}

          <Button label={mode === 'Log in' ? 'Log in' : 'Create account'} onPress={enter} />
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>or</Text>
            <View style={styles.line} />
          </View>
          <Button label="Continue with Apple" variant="outline" onPress={enter} />
          <Button label="Continue with Google" variant="outline" onPress={enter} />
          <Text style={styles.legal}>By continuing you agree to Playcation's Terms and Privacy Policy.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address';
};

function Field({ label, value, onChangeText, placeholder, secure, keyboardType = 'default' }: FieldProps) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A97AB"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' || secure ? 'none' : 'words'}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  body: { padding: 24, gap: 16 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: colors.navy, marginTop: -4 },
  logo: { width: 220, height: 109, alignSelf: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: colors.navy },
  input: { height: 50, borderRadius: radius.md, borderWidth: 1, borderColor: '#C7D0DC', paddingHorizontal: 16, fontSize: 15, color: colors.ink },
  link: { fontSize: 13, fontWeight: '600', color: colors.navy },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { fontSize: 12, color: colors.muted },
  legal: { fontSize: 11, color: colors.muted, textAlign: 'center', lineHeight: 16 },
});
