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
import { saveAiCheck } from './lib/supabase';

type Screen = 'login' | 'plan' | 'exercise' | 'ai-prep' | 'ai-checking' | 'ai-result' | 'pain' | 'pain-warning' | 'saved';
type AlertType = 'good' | 'needs_attention' | 'contact_physio';

type Exercise = {
  id: string;
  name: string;
  meta: string;
  duration: string;
  aiEnabled: boolean;
  instructions: string;
};

const PATIENT = {
  id: 'demo-patient-1',
  code: 'ARB-4821',
  name: 'Arbër Rexha',
  diagnosis: 'Lumbosciatica',
  planTitle: 'Plani juaj 14 ditë – Lumbosciatica',
};

const exercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Glute bridge',
    meta: '3 sete × 12 përsëritje',
    duration: '5 min',
    aiEnabled: true,
    instructions:
      'Shtrihu në shpinë, përkul gjunjët dhe ngriti ijet ngadalë. Mbaje legenin stabil dhe mos e shpejto lëvizjen.',
  },
  {
    id: 'ex-2',
    name: 'Cat cow',
    meta: '2 sete × 10 përsëritje',
    duration: '4 min',
    aiEnabled: true,
    instructions:
      'Fillo me katër këmbë. Lëvize shpinën ngadalë nga pozicioni i maces në pozicionin e lopës pa dhimbje të fortë.',
  },
  {
    id: 'ex-3',
    name: 'Piriformis stretch',
    meta: '3 × 30 sekonda',
    duration: '6 min',
    aiEnabled: false,
    instructions:
      'Kryqëzo këmbën mbi gjurin tjetër dhe tërhiq butësisht drejt gjoksit derisa të ndjesh shtrirje të kontrolluar.',
  },
  {
    id: 'ex-4',
    name: 'Pelvic tilt',
    meta: '2 sete × 12 përsëritje',
    duration: '4 min',
    aiEnabled: true,
    instructions:
      'Shtrihu në shpinë dhe shtype lehtë pjesën e poshtme të shpinës drejt dyshemesë. Lëvizja duhet të jetë e vogël dhe e kontrolluar.',
  },
  {
    id: 'ex-5',
    name: 'Bird dog',
    meta: '2 sete × 8 secila anë',
    duration: '7 min',
    aiEnabled: true,
    instructions:
      'Nga pozicioni me katër këmbë, zgjat dorën dhe këmbën e kundërt. Mbaje trupin stabil dhe mos e lako shpinën.',
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
  const [code, setCode] = useState(PATIENT.code);
  const [error, setError] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0].id);
  const [completedIds, setCompletedIds] = useState<string[]>(['ex-2']);
  const [countdown, setCountdown] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [painScore, setPainScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveText, setSaveText] = useState('');

  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedExerciseId) ?? exercises[0],
    [selectedExerciseId],
  );

  const aiScore = 82;
  const alertType = getAlertType(aiScore);
  const progress = Math.round((completedIds.length / exercises.length) * 100);

  useEffect(() => {
    if (screen !== 'ai-checking') return;

    setCountdown(3);
    setIsAnalyzing(false);
    let count = 3;

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setIsAnalyzing(true);
        const timeout = setTimeout(() => {
          setIsAnalyzing(false);
          setScreen('ai-result');
        }, 1800);
        return () => clearTimeout(timeout);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [screen]);

  function handleLogin() {
    const clean = code.trim().toUpperCase();
    if (clean !== PATIENT.code) {
      setError('Kodi nuk u gjet. Për demo përdor ARB-4821.');
      return;
    }
    setError('');
    setScreen('plan');
  }

  function openExercise(exercise: Exercise) {
    setSelectedExerciseId(exercise.id);
    setPainScore(null);
    setSaveText('');
    setScreen('exercise');
  }

  async function saveResult(score?: number) {
    const finalPainScore = score ?? painScore ?? undefined;
    setSaving(true);
    const result = await saveAiCheck({
      patientId: PATIENT.id,
      planExerciseId: selectedExercise.id,
      score: aiScore,
      feedback: aiFeedback.join(' '),
      alertType,
      painScore: finalPainScore,
    });

    setCompletedIds((current) => Array.from(new Set([...current, selectedExercise.id])));
    setSaving(false);
    setSaveText(result.demoMode ? 'U ruajt në demo mode. Supabase aktivizohet kur shtohen env keys.' : 'U ruajt në Supabase.');
    setScreen('saved');
  }

  function selectPain(score: number) {
    setPainScore(score);
    if (score >= 7) {
      setScreen('pain-warning');
    } else {
      void saveResult(score);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header onHome={() => setScreen(screen === 'login' ? 'login' : 'plan')} />

        {screen === 'login' && (
          <View>
            <View style={styles.heroBlue}>
              <Text style={styles.logoMark}>FP</Text>
              <Text style={styles.heroTitle}>Fizioterapia Ime</Text>
              <Text style={styles.heroText}>Platformë rehabilitimi për pacientin</Text>
            </View>

            <View style={styles.cardLifted}>
              <Text style={styles.title}>Hyr me kodin e pacientit</Text>
              <Text style={styles.text}>Kodi merret nga fizioterapeuti juaj. Pacienti nuk krijon plan vetë.</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  style={styles.input}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="Kodi i pacientit"
                  placeholderTextColor="#8AA0B3"
                />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.86}>
                <Text style={styles.primaryButtonText}>Hyr në plan</Text>
              </TouchableOpacity>
              <Text style={styles.helper}>Demo code: ARB-4821</Text>
            </View>
          </View>
        )}

        {screen === 'plan' && (
          <View>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.whiteSmall}>Mirë se vini,</Text>
                <Text style={styles.whiteTitle}>{PATIENT.name}</Text>
                <Text style={styles.whiteText}>{PATIENT.planTitle}</Text>
              </View>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>Dita 3/14</Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.progressTitle}>Ushtrime të kryera sot</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.helper}>{completedIds.length}/{exercises.length} ushtrime të kryera</Text>
            </View>

            <View style={styles.calendarRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <View key={day} style={[styles.calendarPill, day === 3 && styles.calendarActive]}>
                  <Text style={[styles.calendarText, day === 3 && styles.calendarActiveText]}>{day}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Ushtrimet për sot</Text>
            {exercises.map((exercise) => {
              const completed = completedIds.includes(exercise.id);
              return (
                <TouchableOpacity key={exercise.id} style={[styles.exerciseCard, completed && styles.exerciseDone]} onPress={() => openExercise(exercise)} activeOpacity={0.8}>
                  <View style={[styles.exerciseIcon, completed && styles.exerciseIconDone]}>
                    <Text style={styles.exerciseIconText}>{completed ? '✓' : '↗'}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.smallText}>{exercise.meta} · {exercise.duration}</Text>
                    {exercise.aiEnabled && <Text style={styles.aiMini}>AI check aktiv</Text>}
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {screen === 'exercise' && (
          <View>
            <TouchableOpacity onPress={() => setScreen('plan')}><Text style={styles.back}>‹ Kthehu te plani</Text></TouchableOpacity>
            <View style={styles.card}>
              <Text style={styles.eyebrow}>Ushtrimi</Text>
              <Text style={styles.title}>{selectedExercise.name}</Text>
              <View style={styles.videoBox}>
                <Text style={styles.videoIcon}>▶</Text>
                <Text style={styles.videoText}>Video udhëzuese</Text>
              </View>
              <View style={styles.infoGrid}>
                <InfoPill label="Sete" value={selectedExercise.meta} />
                <InfoPill label="Koha" value={selectedExercise.duration} />
              </View>
              <Text style={styles.text}>{selectedExercise.instructions}</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('ai-prep')} activeOpacity={0.86}>
                <Text style={styles.primaryButtonText}>Kontrollo lëvizjen me kamerë</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('pain')} activeOpacity={0.86}>
                <Text style={styles.secondaryButtonText}>E përfundova ushtrimin</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {screen === 'ai-prep' && (
          <View>
            <TouchableOpacity onPress={() => setScreen('exercise')}><Text style={styles.back}>‹ Kthehu te ushtrimi</Text></TouchableOpacity>
            <View style={styles.card}>
              <Text style={styles.eyebrow}>AI Movement Check</Text>
              <Text style={styles.title}>Përgatitu për kontrollin me kamerë</Text>
              <View style={styles.cameraPrepBox}>
                <Text style={styles.cameraEmoji}>📱</Text>
                <Text style={styles.textCenter}>Telefoni duhet të shohë trupin qartë.</Text>
              </View>
              <Instruction text="Vendose telefonin në një vend stabil." />
              <Instruction text="Trupi duhet të shihet qartë në ekran." />
              <Instruction text="Bëje ushtrimin ngadalë dhe me kontroll." />
              <View style={styles.safetyBox}>
                <Text style={styles.safetyText}>AI mat vetëm cilësinë e lëvizjes. Nuk diagnostikon dhe nuk ndryshon planin. Fizioterapeuti mbetet vendimmarrës i fundit.</Text>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('ai-checking')} activeOpacity={0.86}>
                <Text style={styles.primaryButtonText}>Fillo kontrollin</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {screen === 'ai-checking' && (
          <View style={styles.darkScreen}>
            <Text style={styles.darkSmall}>{selectedExercise.name}</Text>
            <View style={styles.cameraFrame}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
              <View style={styles.bodyGuide}>
                <View style={styles.head} />
                <View style={styles.bodyLine} />
                <View style={styles.armLine} />
                <View style={styles.legLine} />
              </View>
              <View style={styles.scanLine} />
            </View>
            {!isAnalyzing ? (
              <>
                <Text style={styles.countdownHint}>Fillo ushtrimin...</Text>
                <Text style={styles.countdown}>{countdown}</Text>
              </>
            ) : (
              <>
                <ActivityIndicator color="#62D6A4" size="large" />
                <Text style={styles.analyzing}>Duke analizuar lëvizjen...</Text>
              </>
            )}
          </View>
        )}

        {screen === 'ai-result' && (
          <View>
            <View style={styles.resultCard}>
              <Text style={styles.eyebrow}>Rezultati i AI</Text>
              <Text style={styles.score}>{aiScore}%</Text>
              <Text style={styles.title}>Lëvizje e mirë</Text>
              <View style={styles.resultBadge}><Text style={styles.resultBadgeText}>{alertType}</Text></View>
              {aiFeedback.map((item) => <Instruction key={item} text={item} />)}
              <View style={styles.safetyBox}>
                <Text style={styles.safetyText}>Ky feedback nuk e zëvendëson vlerësimin e fizioterapeutit.</Text>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('pain')} activeOpacity={0.86}>
                <Text style={styles.primaryButtonText}>Raporto dhimbjen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {screen === 'pain' && (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>Siguria</Text>
            <Text style={styles.title}>Sa dhimbje pate gjatë ushtrimit?</Text>
            <Text style={styles.text}>Zgjedh 0–10. Nëse dhimbja është 7 ose më shumë, ndalo ushtrimin dhe kontakto fizioterapeutin.</Text>
            <View style={styles.painGrid}>
              {Array.from({ length: 11 }, (_, index) => (
                <TouchableOpacity key={index} style={styles.painButton} onPress={() => selectPain(index)} activeOpacity={0.8}>
                  <Text style={styles.painText}>{index}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {saving && <ActivityIndicator color="#2D9E5F" style={{ marginTop: 16 }} />}
          </View>
        )}

        {screen === 'pain-warning' && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.title}>Ndalo ushtrimin</Text>
            <Text style={styles.text}>Dhimbja është {painScore}/10. Ndalo ushtrimin dhe kontakto fizioterapeutin para se të vazhdosh.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => void saveResult()} activeOpacity={0.86}>
              <Text style={styles.primaryButtonText}>{saving ? 'Duke ruajtur...' : 'Ruaj dhe kthehu te plani'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'saved' && (
          <View style={styles.card}>
            <Text style={styles.savedIcon}>✓</Text>
            <Text style={styles.title}>U ruajt kontrolli</Text>
            <Text style={styles.text}>{saveText || 'Rezultati u ruajt.'}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('plan')} activeOpacity={0.86}>
              <Text style={styles.primaryButtonText}>Kthehu te plani</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onHome }: { onHome: () => void }) {
  return (
    <TouchableOpacity style={styles.header} onPress={onHome} activeOpacity={0.8}>
      <View style={styles.headerLogo}><Text style={styles.headerLogoText}>FP</Text></View>
      <View>
        <Text style={styles.headerTitle}>FizioPlan</Text>
        <Text style={styles.headerSubtitle}>Fizioterapia Ime</Text>
      </View>
    </TouchableOpacity>
  );
}

function Instruction({ text }: { text: string }) {
  return (
    <View style={styles.instruction}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5FAFD' },
  container: { padding: 18, paddingBottom: 42 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, marginTop: 4 },
  headerLogo: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#2C6EAB', alignItems: 'center', justifyContent: 'center' },
  headerLogoText: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#102033' },
  headerSubtitle: { fontSize: 13, color: '#6B7A90', marginTop: 2 },

  heroBlue: { backgroundColor: '#2C6EAB', borderRadius: 30, padding: 28, alignItems: 'center', marginBottom: -18 },
  logoMark: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFFFFF', color: '#2C6EAB', textAlign: 'center', textAlignVertical: 'center', fontSize: 28, fontWeight: '900', overflow: 'hidden', marginBottom: 14 },
  heroTitle: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  heroText: { color: 'rgba(255,255,255,0.82)', fontSize: 15, marginTop: 8 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 22, borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  cardLifted: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 22, borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 5 },
  title: { fontSize: 27, lineHeight: 32, fontWeight: '900', color: '#102033', letterSpacing: -0.5, marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 24, color: '#496175', marginBottom: 16 },
  smallText: { fontSize: 13, lineHeight: 18, color: '#6B7A90' },
  helper: { fontSize: 13, color: '#6B7A90', marginTop: 10, textAlign: 'center' },
  eyebrow: { color: '#2C6EAB', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },

  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#D1E5F8', borderRadius: 16, paddingHorizontal: 14, backgroundColor: '#FBFDFF', marginBottom: 12 },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, paddingVertical: 16, fontSize: 18, color: '#102033', fontWeight: '800', letterSpacing: 1.2 },
  error: { color: '#EF4444', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, padding: 12, marginBottom: 12 },

  primaryButton: { backgroundColor: '#2D9E5F', borderRadius: 18, paddingVertical: 17, paddingHorizontal: 18, alignItems: 'center', marginTop: 10, shadowColor: '#2D9E5F', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  secondaryButton: { backgroundColor: '#E8F4FD', borderRadius: 18, paddingVertical: 17, paddingHorizontal: 18, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#2C6EAB', fontSize: 17, fontWeight: '900' },

  planHeader: { backgroundColor: '#2C6EAB', borderRadius: 28, padding: 22, flexDirection: 'row', justifyContent: 'space-between', gap: 14, marginBottom: 14 },
  whiteSmall: { color: 'rgba(255,255,255,0.82)', fontSize: 14 },
  whiteTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', marginTop: 2 },
  whiteText: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 6, maxWidth: 220 },
  dayBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)' },
  dayBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#DCEAF2', marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontSize: 16, color: '#102033', fontWeight: '800' },
  progressPercent: { fontSize: 18, color: '#2D9E5F', fontWeight: '900' },
  progressTrack: { height: 11, backgroundColor: '#EAF2F7', borderRadius: 999, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: '#2D9E5F', borderRadius: 999 },
  calendarRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  calendarPill: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCEAF2', alignItems: 'center', justifyContent: 'center' },
  calendarActive: { backgroundColor: '#2C6EAB' },
  calendarText: { color: '#6B7A90', fontWeight: '800' },
  calendarActiveText: { color: '#FFFFFF' },
  sectionTitle: { fontSize: 20, color: '#102033', fontWeight: '900', marginBottom: 12 },

  exerciseCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#DCEAF2', marginBottom: 12 },
  exerciseDone: { backgroundColor: '#F0FFF4', borderColor: '#BBF7D0' },
  exerciseIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2C6EAB', alignItems: 'center', justifyContent: 'center' },
  exerciseIconDone: { backgroundColor: '#2D9E5F' },
  exerciseIconText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 18, color: '#102033', fontWeight: '900', marginBottom: 4 },
  aiMini: { color: '#2C6EAB', fontSize: 12, fontWeight: '900', marginTop: 4 },
  chevron: { fontSize: 34, color: '#9AAABD' },
  back: { color: '#2C6EAB', fontWeight: '900', marginBottom: 14, fontSize: 16 },

  videoBox: { height: 190, borderRadius: 24, backgroundColor: '#E8F4FD', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#D1E5F8' },
  videoIcon: { fontSize: 48, color: '#2C6EAB', marginBottom: 8 },
  videoText: { color: '#2C6EAB', fontWeight: '800' },
  infoGrid: { gap: 10, marginBottom: 12 },
  infoPill: { backgroundColor: '#F5F8FA', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#E2EBF5' },
  infoLabel: { color: '#6B7A90', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  infoValue: { color: '#102033', fontSize: 15, fontWeight: '900', marginTop: 3 },

  cameraPrepBox: { backgroundColor: '#E8F4FD', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#D1E5F8' },
  cameraEmoji: { fontSize: 58, marginBottom: 8 },
  textCenter: { textAlign: 'center', color: '#496175', fontSize: 15 },
  instruction: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F8FCFF', borderRadius: 15, padding: 13, borderWidth: 1, borderColor: '#E2EBF5', marginBottom: 9 },
  check: { color: '#2D9E5F', fontWeight: '900', fontSize: 16 },
  instructionText: { flex: 1, color: '#102033', fontSize: 15, lineHeight: 21 },
  safetyBox: { backgroundColor: '#FFFBEB', borderRadius: 15, padding: 13, borderWidth: 1, borderColor: '#FDE68A', marginTop: 6, marginBottom: 8 },
  safetyText: { color: '#8A5C09', fontSize: 13, lineHeight: 19 },

  darkScreen: { backgroundColor: '#080F1A', borderRadius: 28, padding: 18, minHeight: 620, alignItems: 'center', justifyContent: 'center' },
  darkSmall: { color: 'rgba(255,255,255,0.72)', fontSize: 15, marginBottom: 20 },
  cameraFrame: { width: '100%', height: 310, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(98,214,164,0.6)', backgroundColor: '#0D1E32', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 28 },
  cornerTopLeft: { position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#62D6A4' },
  cornerTopRight: { position: 'absolute', top: 16, right: 16, width: 38, height: 38, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#62D6A4' },
  cornerBottomLeft: { position: 'absolute', bottom: 16, left: 16, width: 38, height: 38, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#62D6A4' },
  cornerBottomRight: { position: 'absolute', bottom: 16, right: 16, width: 38, height: 38, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#62D6A4' },
  bodyGuide: { alignItems: 'center', justifyContent: 'center' },
  head: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, borderColor: 'rgba(255,255,255,0.78)', marginBottom: 8 },
  bodyLine: { width: 4, height: 82, backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: 999 },
  armLine: { position: 'absolute', width: 118, height: 4, backgroundColor: 'rgba(255,255,255,0.58)', borderRadius: 999, top: 58, transform: [{ rotate: '-8deg' }] },
  legLine: { position: 'absolute', width: 118, height: 4, backgroundColor: 'rgba(255,255,255,0.58)', borderRadius: 999, bottom: -4, transform: [{ rotate: '22deg' }] },
  scanLine: { position: 'absolute', left: 0, right: 0, top: '48%', height: 3, backgroundColor: '#62D6A4', opacity: 0.86 },
  countdownHint: { color: 'rgba(255,255,255,0.72)', fontSize: 16, marginBottom: 8 },
  countdown: { color: '#FFFFFF', fontSize: 82, fontWeight: '900' },
  analyzing: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 18 },

  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#BBF7D0' },
  score: { fontSize: 78, fontWeight: '900', color: '#2D9E5F', letterSpacing: -3, marginBottom: 0 },
  resultBadge: { alignSelf: 'flex-start', backgroundColor: '#F0FFF4', borderColor: '#BBF7D0', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginBottom: 14 },
  resultBadgeText: { color: '#2D9E5F', fontWeight: '900' },
  painGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  painButton: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#E8F4FD', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D1E5F8' },
  painText: { color: '#2C6EAB', fontSize: 20, fontWeight: '900' },
  warningCard: { backgroundColor: '#FEF2F2', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#FCA5A5' },
  warningIcon: { fontSize: 48, marginBottom: 12 },
  savedIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#2D9E5F', color: '#FFFFFF', textAlign: 'center', textAlignVertical: 'center', fontSize: 40, fontWeight: '900', overflow: 'hidden', marginBottom: 16 },
});
