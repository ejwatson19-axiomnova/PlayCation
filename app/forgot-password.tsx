import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Button } from '@/src/components/ui';
import { colors, radius } from '@/src/theme';

// Sends nothing yet: real password reset arrives with sign-in.
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter the email you signed up with.');
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Reset password" />
      <View style={styles.body}>
        {sent ? (
          <>
            <Text style={styles.h1}>Check your email</Text>
            <Text style={styles.p}>We sent a reset link to {email.trim()}. It expires in 1 hour.</Text>
            <Button label="Back to log in" onPress={() => router.back()} />
          </>
        ) : (
          <>
            <Text style={styles.p}>Enter your email and we'll send you a link to reset your password.</Text>
            <TextInput
              accessibilityLabel="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError('');
              }}
              placeholder="you@example.com"
              placeholderTextColor="#8A97AB"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Send reset link" onPress={submit} />
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
  input: { height: 50, borderRadius: radius.md, borderWidth: 1, borderColor: '#C7D0DC', paddingHorizontal: 16, fontSize: 15, color: colors.ink },
  error: { fontSize: 13, color: colors.alert },
});
