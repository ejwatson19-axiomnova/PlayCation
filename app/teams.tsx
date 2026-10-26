import { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Button, Card } from '@/src/components/ui';
import { useApp } from '@/src/state/AppState';
import { colors, radius } from '@/src/theme';

type Team = { name: string; sport: string; families: string[] };

export default function TeamsScreen() {
  const { sport } = useApp();
  const [teams, setTeams] = useState<Team[]>([{ name: '[Team name]', sport: sport.division, families: ['You', '[Family 2]', '[Family 3]'] }]);
  const [newName, setNewName] = useState('');

  const invite = (team: Team) =>
    Share.share({ message: `Join ${team.name} on Playcation to book stays near our tournaments together.` }).catch(() => {});

  const add = () => {
    if (!newName.trim()) return;
    setTeams([...teams, { name: newName.trim(), sport: sport.division, families: ['You'] }]);
    setNewName('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="My teams" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {teams.map((t) => (
          <Card key={t.name} style={{ gap: 10 }}>
            <Text style={styles.h2}>{t.name}</Text>
            <Text style={styles.sub}>
              {t.sport} · {t.families.length} {t.families.length === 1 ? 'family' : 'families'}
            </Text>
            <Text style={styles.members}>{t.families.join(' · ')}</Text>
            <Button label="Invite a family" variant="outline" onPress={() => invite(t)} />
          </Card>
        ))}

        <Text style={styles.label}>Add a team</Text>
        <View style={styles.addRow}>
          <TextInput
            accessibilityLabel="Team name"
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={add}
            placeholder="Team name"
            placeholderTextColor="#8A97AB"
            style={styles.input}
          />
          <Button label="Add" onPress={add} style={{ paddingHorizontal: 22 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { padding: 20, gap: 14 },
  h2: { fontSize: 17, fontWeight: '800', color: colors.navy },
  sub: { fontSize: 13, color: colors.muted },
  members: { fontSize: 14, color: colors.ink },
  label: { fontSize: 14, fontWeight: '700', color: colors.navy },
  addRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, height: 52, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: '#C7D0DC', paddingHorizontal: 16, fontSize: 15, color: colors.ink },
});
