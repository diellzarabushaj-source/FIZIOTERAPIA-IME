import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Screen = 'login' | 'plan' | 'exercise' | 'ai';

const exercises = [
  { name: 'Glute bridge', meta: '3 sete × 12 përsëritje', status: 'Sot' },
  { name: 'Cat cow', meta: '2 sete × 10 përsëritje', status: 'Sot' },
  { name: 'Piriformis stretch', meta: '3 × 30 sekonda', status: 'Nesër' },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [code, setCode] = useState('ARB-4821');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>FizioPlan</Text>
          <Text style={styles.subtitle}>Fizioterapia Ime</Text>
        </View>

        {screen === 'login' && (
          <View style={styles.card}>
            <Text style={styles.title}>Hyr me kodin e pacientit</Text>
            <Text style={styles.text}>Kodi merret nga fizioterapeuti juaj.</Text>
            <TextInput value={code} onChangeText={setCode} style={styles.input} autoCapitalize="characters" />
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('plan')}>
              <Text style={styles.primaryButtonText}>Hyr në plan</Text>
            </TouchableOpacity>
            <Text style={styles.smallText}>Demo code: ARB-4821</Text>
          </View>
        )}

        {screen === 'plan' && (
          <View>
            <View style={styles.cardBlue}>
              <Text style={styles.eyebrow}>Plani aktiv</Text>
              <Text style={styles.title}>Lumbosciatica – 14 ditë</Text>
              <Text style={styles.text}>Ushtrime të kryera sot: 2/5</Text>
            </View>

            {exercises.map((exercise) => (
              <TouchableOpacity key={exercise.name} style={styles.exerciseCard} onPress={() => setScreen('exercise')}>
                <View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.smallText}>{exercise.meta}</Text>
                </View>
                <Text style={styles.badge}>{exercise.status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {screen === 'exercise' && (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>Ushtrimi</Text>
            <Text style={styles.title}>Glute bridge</Text>
            <View style={styles.videoBox}>
              <Text style={styles.videoIcon}>▶</Text>
              <Text style={styles.smallText}>Video udhëzuese</Text>
            </View>
            <Text style={styles.text}>3 sete × 12 përsëritje. Lëviz ngadalë, mbaje shpinën stabile dhe mos e sforco nëse ke dhimbje të fortë.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('ai')}>
              <Text style={styles.primaryButtonText}>Kontrollo lëvizjen me kamerë</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('plan')}>
              <Text style={styles.secondaryButtonText}>E përfundova ushtrimin</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'ai' && (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>AI kontroll</Text>
            <Text style={styles.score}>82%</Text>
            <Text style={styles.title}>Lëvizje e mirë</Text>
            <Text style={styles.text}>Mirë, por mbaje legenin më stabil gjatë ngritjes. Nëse dhimbja rritet, ndalo dhe kontakto fizioterapeutin.</Text>
            <View style={styles.note}>
              <Text style={styles.smallText}>Ky feedback nuk e zëvendëson vlerësimin e fizioterapeutit.</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('plan')}>
              <Text style={styles.primaryButtonText}>Kthehu te plani</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fbff' },
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 12 },
  logo: { fontSize: 34, fontWeight: '800', color: '#0b3a5b' },
  subtitle: { fontSize: 16, color: '#3a6f8f', marginTop: 4 },
  card: { backgroundColor: '#ffffff', borderRadius: 28, padding: 22, shadowColor: '#102a43', shadowOpacity: 0.08, shadowRadius: 18, elevation: 4 },
  cardBlue: { backgroundColor: '#dff3ff', borderRadius: 28, padding: 22, marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '800', color: '#102a43', marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 24, color: '#35566b', marginBottom: 16 },
  smallText: { fontSize: 13, lineHeight: 18, color: '#6b8797' },
  eyebrow: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#247ba0', fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d6e4ee', borderRadius: 18, padding: 16, fontSize: 18, fontWeight: '700', marginBottom: 14, color: '#102a43', backgroundColor: '#fbfdff' },
  primaryButton: { backgroundColor: '#16a085', paddingVertical: 16, borderRadius: 18, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#eef7f5', paddingVertical: 16, borderRadius: 18, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#107967', fontSize: 16, fontWeight: '800' },
  exerciseCard: { backgroundColor: '#ffffff', borderRadius: 22, padding: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#102a43', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  exerciseName: { fontSize: 18, fontWeight: '800', color: '#102a43', marginBottom: 4 },
  badge: { backgroundColor: '#e7f8f3', color: '#107967', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, fontWeight: '800', overflow: 'hidden' },
  videoBox: { height: 180, borderRadius: 24, backgroundColor: '#e8f4fb', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  videoIcon: { fontSize: 44, color: '#0b72b9', marginBottom: 8 },
  score: { fontSize: 70, fontWeight: '900', color: '#16a085', marginBottom: 2 },
  note: { backgroundColor: '#f0f7fb', borderRadius: 18, padding: 14, marginBottom: 12 },
});
