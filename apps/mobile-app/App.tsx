import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  loginPatientWithCode,
  saveMobileProgress,
  type MobileExercise,
  type MobilePatient,
} from './lib/api';

type Screen = 'login' | 'plan' | 'exercise' | 'ai-prep' | 'ai-checking' | 'ai-result' | 'pain' | 'pain-warning' | 'saved';
type AlertType = 'good' | 'needs_attention' | 'contact_physio';

const DEMO_PATIENT: MobilePatient = {
  id: 'demo-patient-1',
  code: 'ARB-4821',
  name: 'Arbër Rexha',
  diagnosis: 'Lumbosciatica',
};

const DEMO_PLAN_TITLE = 'Plani juaj 14 ditë – Lumbosciatica';

const DEMO_EXERCISES: MobileExercise[] = [
  {
    id: 'ex-1',
    planExerciseId: 'ex-1',
    name: 'Glute bridge',
    meta: '3 sete × 12 përsëritje',
    duration: '5 min',
    aiEnabled: true,
    instructions: 'Shtrihu në shpinë, përkul gjunjët dhe ngriti ijet ngadalë. Mbaje legenin stabil dhe mos e shpejto lëvizjen.',
  },
  {
    id: 'ex-2',
    planExerciseId: 'ex-2',
    name: 'Cat cow',
    meta: '2 sete × 10 përsëritje',
    duration: '4 min',
    aiEnabled: true,
    instructions: 'Fillo me katër këmbë. Lëvize shpinën ngadalë nga pozicioni i maces në pozicionin e lopës pa dhimbje të fortë.',
  },
  {
    id: 'ex-3',
    planExerciseId: 'ex-3',
    name: 'Piriformis stretch',
    meta: '3 × 30 sekonda',
    duration: '6 min',
    aiEnabled: false,
    instructions: 'Kryqëzo këmbën mbi gjurin tjetër dhe tërhiq butësisht drejt gjoksit derisa të ndjesh shtrirje të kontrolluar.',
  },
  {
    id: 'ex-4',
    planExerciseId: 'ex-4',
    name: 'Pelvic tilt',
    meta: '2 sete × 12 përsëritje',
    duration: '4 min',
    aiEnabled: true,
    instructions: 'Shtrihu në shpinë dhe shtype lehtë pjesën e poshtme të shpinës drejt dyshemesë. Lëvizja duhet të jetë e vogël dhe e kontrolluar.',
  },
];

const aiFeedback = [
  'Mbaje legenin më stabil gjatë ngritjes.',
  'Mos e shpejto lëvizjen.',
  'Nëse dhimbja rritet, ndalo dhe kontakto fizioterapeutin.',
];

function getAlertType(score: number): AlertType {
  if (score > 80) return 'good';
  if (score >= 60) return 'needs_attention';
  return 'contact_physio';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [code, setCode] = useState(DEMO_PATIENT.code);
  const [sessionCode, setSessionCode] = useState('');
  const [patient, setPatient] = useState<MobilePatient | null>(null);
  const [planTitle, setPlanTitle] = useState(DEMO_PLAN_TITLE);
  const [exercises, setExercises] = useState<MobileExercise[]>(DEMO_EXERCISES);
  const [selectedExerciseId, setSelectedExerciseId] = useState(DEMO_EXERCISES[0].id);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [onlineMode, setOnlineMode] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [painScore, setPainScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveText, setSaveText] = useState('');

  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedExerciseId) ?? exercises[0],
    [exercises, selectedExerciseId],
  );

  const aiScore = 82;
  const alertType = getAlertType(aiScore);
  const progress = exercises.length ? Math.round((completedIds.length / exercises.length) * 100) : 0;
  const currentPatient = patient ?? DEMO_PATIENT;

  useEffect(() => {
    if (screen !== 'ai-checking') return;

    let count = 3;

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          setScreen('ai-result');
        }, 1800);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [screen]);

  async function handleLogin() {
    const clean = code.trim().toUpperCase().replace(/\s+/g, '');
    setError('');
    setLoadingLogin(true);

    try {
      const session = await loginPatientWithCode(clean);
      setPatient(session.patient);
      setPlanTitle(session.plan?.title || `Plani juaj – ${session.patient.diagnosis}`);
      setExercises(session.exercises.length ? session.exercises : DEMO_EXERCISES);
      setSelectedExerciseId((session.exercises[0] ?? DEMO_EXERCISES[0]).id);
      setCompletedIds(session.completedIds || []);
      setSessionCode(clean);
      setOnlineMode(true);
      setScreen('plan');
    } catch (loginError) {
      if (clean === DEMO_PATIENT.code) {
        setPatient(DEMO_PATIENT);
        setPlanTitle(DEMO_PLAN_TITLE);
        setExercises(DEMO_EXERCISES);
        setSelectedExerciseId(DEMO_EXERCISES[0].id);
        setCompletedIds(['ex-2']);
        setSessionCode(clean);
        setOnlineMode(false);
        setSaveText('Demo mode aktiv. Lidhe EXPO_PUBLIC_API_BASE_URL me web app për Supabase live.');
        setScreen('plan');
      } else {
        setError(loginError instanceof Error ? loginError.message : 'Kodi nuk u gjet. Kontrollo kodin nga fizioterapeuti.');
      }
    } finally {
      setLoadingLogin(false);
    }
  }

  function openExercise(exercise: MobileExercise) {
    setSelectedExerciseId(exercise.id);
    setPainScore(null);
    setSaveText('');
    setScreen('exercise');
  }

  async function saveResult(score?: number) {
    const finalPainScore = score ?? painScore ?? undefined;
    const activePatient = patient ?? DEMO_PATIENT;
    setSaving(true);

    try {
      if (onlineMode) {
        await saveMobileProgress({
          code: sessionCode,
          patientId: activePatient.id,
          planExerciseId: selectedExercise.planExerciseId || selectedExercise.id,
          score: aiScore,
          feedback: aiFeedback.join(' '),
          alertType,
          painScore: finalPainScore,
        });
        setSaveText('U ruajt në Supabase.');
      } else {
        setSaveText('U ruajt në demo mode. Për live mode përdoret web API + Supabase + Resend server-side.');
      }

      setCompletedIds((current) => Array.from(new Set([...current, selectedExercise.id])));
      setScreen('saved');
    } catch (saveError) {
      setSaveText(saveError instanceof Error ? saveError.message : 'Ruajtja dështoi. Provo përsëri.');
      setScreen('saved');
    } finally {
      setSaving(false);
    }
  }

  function selectPain(score: number) {
    setPainScore(score);
    if (score >= 7) {
      setScreen('pain-warning');
    } else {
      void saveResult(score);
    }
  }

  function startAiCheck() {
    setCountdown(3);
    setIsAnalyzing(false);
    setScreen('ai-checking');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header onHome={() => setScreen(screen === 'login' ? 'login' : 'plan')} onlineMode={onlineMode} />

        {screen === 'login' && (
          <View>
            <View style={styles.heroBlue}>
              <Text style={styles.logoMark}>FI</Text>
              <Text style={styles.heroTitle}>Fizioterapia ime</Text>
              <Text style={styles.heroSubtitle}>Programi yt i ushtrimeve, në telefon.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Hyr me kodin e pacientit</Text>
              <Text style={styles.paragraph}>Kodi merret nga fizioterapeuti. Për demo përdor ARB-4821.</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                placeholder="ARB-4821"
                style={styles.input}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loadingLogin}>
                {loadingLogin ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Hyr në plan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {screen === 'plan' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.eyebrow}>Pacienti</Text>
              <Text style={styles.sectionTitle}>{currentPatient.name}</Text>
              <Text style={styles.paragraph}>{currentPatient.diagnosis}</Text>
              <Text style={styles.sectionTitle}>{planTitle}</Text>
              <Text style={styles.paragraph}>{progress}% e programit e përfunduar</Text>
              <View style={styles.progressTrack}><View style={[styles.progressBar, { width: `${progress}%` }]} /></View>
            </View>
            {exercises.map((exercise) => (
              <TouchableOpacity key={exercise.id} style={styles.exerciseCard} onPress={() => openExercise(exercise)}>
                <View style={styles.exerciseMain}>
                  <Text style={styles.exerciseTitle}>{completedIds.includes(exercise.id) ? '✓ ' : ''}{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>{exercise.meta} · {exercise.duration}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {screen === 'exercise' && selectedExercise && (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>Ushtrimi</Text>
            <Text style={styles.sectionTitle}>{selectedExercise.name}</Text>
            <Text style={styles.paragraph}>{selectedExercise.instructions}</Text>
            <Text style={styles.exerciseMeta}>{selectedExercise.meta} · {selectedExercise.duration}</Text>
            {selectedExercise.aiEnabled ? (
              <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('ai-prep')}>
                <Text style={styles.primaryButtonText}>AI Movement Check</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('pain')}>
                <Text style={styles.primaryButtonText}>Shëno si të përfunduar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {screen === 'ai-prep' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Përgatitu për kamerën</Text>
            <Text style={styles.paragraph}>Vendose telefonin në një pozicion stabil dhe sigurohu që trupi të shihet qartë. AI jep vetëm feedback teknik; nuk jep diagnozë.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={startAiCheck}>
              <Text style={styles.primaryButtonText}>Fillo kontrollin</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'ai-checking' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{isAnalyzing ? 'Duke analizuar…' : `Fillo pas ${countdown}`}</Text>
            <ActivityIndicator size="large" color="#6f99d6" />
          </View>
        )}

        {screen === 'ai-result' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rezultati: {aiScore}/100</Text>
            {aiFeedback.map((item) => <Text key={item} style={styles.paragraph}>• {item}</Text>)}
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('pain')}>
              <Text style={styles.primaryButtonText}>Vazhdo</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'pain' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sa dhimbje ke pas ushtrimit?</Text>
            <View style={styles.painGrid}>
              {Array.from({ length: 11 }, (_, score) => (
                <TouchableOpacity key={score} style={styles.painButton} onPress={() => selectPain(score)}>
                  <Text style={styles.painText}>{score}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {screen === 'pain-warning' && (
          <View style={styles.warningCard}>
            <Text style={styles.sectionTitle}>Ndalo ushtrimin</Text>
            <Text style={styles.paragraph}>Dhimbja 7/10 ose më shumë duhet të raportohet. Kontakto fizioterapeutin para se të vazhdosh.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => void saveResult(painScore ?? 7)} disabled={saving}>
              <Text style={styles.primaryButtonText}>{saving ? 'Duke ruajtur…' : 'Ruaj dhe njofto fizioterapeutin'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'saved' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>U ruajt</Text>
            <Text style={styles.paragraph}>{saveText}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('plan')}>
              <Text style={styles.primaryButtonText}>Kthehu te plani</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onHome, onlineMode }: { onHome: () => void; onlineMode: boolean }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onHome}><Text style={styles.headerTitle}>Fizioterapia Ime</Text></TouchableOpacity>
      <Text style={styles.modeText}>{onlineMode ? 'LIVE' : 'DEMO'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f8fc' },
  container: { padding: 18, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  headerTitle: { fontWeight: '800', fontSize: 18, color: '#244163' },
  modeText: { fontSize: 12, fontWeight: '800', color: '#6f99d6' },
  heroBlue: { backgroundColor: '#dceaff', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 18 },
  logoMark: { fontSize: 30, fontWeight: '900', color: '#244163' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#244163', marginTop: 8 },
  heroSubtitle: { color: '#4a6280', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#15283d', shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  warningCard: { backgroundColor: '#fff1f0', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#ffccc7' },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1f3550', marginBottom: 8 },
  paragraph: { color: '#52667d', lineHeight: 21, marginBottom: 10 },
  eyebrow: { color: '#6f99d6', fontWeight: '800', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d8e1ec', borderRadius: 14, padding: 14, fontSize: 16, marginVertical: 14, backgroundColor: '#fff' },
  primaryButton: { backgroundColor: '#6f99d6', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  error: { color: '#b42318', fontWeight: '700', marginBottom: 8 },
  exerciseCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exerciseMain: { flex: 1 },
  exerciseTitle: { fontSize: 17, fontWeight: '800', color: '#243b55' },
  exerciseMeta: { color: '#6a7c91', marginTop: 4 },
  arrow: { fontSize: 28, color: '#6f99d6' },
  progressTrack: { height: 9, backgroundColor: '#e9eef5', borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  progressBar: { height: '100%', backgroundColor: '#6f99d6' },
  painGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  painButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#edf3fb', alignItems: 'center', justifyContent: 'center' },
  painText: { color: '#244163', fontWeight: '800' },
});
