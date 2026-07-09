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
        const result = await saveMobileProgress({
          code: sessionCode,
          patientId: activePatient.id,
          planExerciseId: selectedExercise.planExerciseId || selectedExercise.id,
          score: aiScore,
          feedback: aiFeedback.join(' '),
          alertType,
          painScore: finalPainScore,
        });
        setSaveText(result.notification?.sent ? 'U ruajt në Supabase dhe fizioterapeuti u njoftua.' : 'U ruajt në Supabase.');
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
              <Text style={styles.heroText}>App për pacientin · plan i udhëhequr nga fizioterapeuti</Text>
            </View>

            <View style={styles.cardLifted}>
              <Text style={styles.title}>Hyr në planin tënd</Text>
              <Text style={styles.text}>Kodin e merr nga fizioterapeuti. Shkruaje këtu dhe vazhdo me ushtrimet e tua.</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>⌁</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  style={styles.input}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="Kodi i pacientit"
                  placeholderTextColor="#8AA0B3"
                  onSubmitEditing={() => void handleLogin()}
                />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={styles.primaryButton} onPress={() => void handleLogin()} activeOpacity={0.86} disabled={loadingLogin}>
                <Text style={styles.primaryButtonText}>{loadingLogin ? 'Duke hyrë...' : 'Hyr në plan'}</Text>
              </TouchableOpacity>
              {loadingLogin && <ActivityIndicator color="#0F8F86" style={{ marginTop: 14 }} />}
              <Text style={styles.helper}>Demo code: ARB-4821</Text>
            </View>
          </View>
        )}

        {screen === 'plan' && (
          <View>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.whiteSmall}>Mirë se vini,</Text>
                <Text style={styles.whiteTitle}>{currentPatient.name}</Text>
                <Text style={styles.whiteText}>{planTitle}</Text>
              </View>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{onlineMode ? 'Live' : 'Demo'}</Text>
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

            <View style={styles.safetyBox}>
              <Text style={styles.safetyText}>Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.</Text>
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

        {screen === 'exercise' && selectedExercise && (
          <View>
            <TouchableOpacity onPress={() => setScreen('plan')}><Text style={styles.back}>‹ Kthehu te plani</Text></TouchableOpacity>
            <View style={styles.card}>
              <Text style={styles.eyebrow}>Ushtrimi</Text>
              <Text style={styles.title}>{selectedExercise.name}</Text>
              <View style={styles.videoBox}>
                <Text style={styles.videoIcon}>▶</Text>
                <Text style={styles.videoText}>{selectedExercise.videoUrl ? 'Video udhëzuese' : 'Udhëzim nga fizioterapeuti'}</Text>
              </View>
              <View style={styles.infoGrid}>
                <InfoPill label="Sete" value={selectedExercise.meta} />
                <InfoPill label="Koha" value={selectedExercise.duration} />
              </View>
              <Text style={styles.text}>{selectedExercise.instructions}</Text>
              {selectedExercise.aiEnabled && (
                <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('ai-prep')} activeOpacity={0.86}>
                  <Text style={styles.primaryButtonText}>Kontrollo lëvizjen me kamerë</Text>
                </TouchableOpacity>
              )}
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
                <Text style={styles.cameraEmoji}>▭</Text>
                <Text style={styles.textCenter}>Telefoni duhet të shohë trupin qartë.</Text>
              </View>
              <Instruction text="Vendose telefonin në një vend stabil." />
              <Instruction text="Trupi duhet të shihet qartë në ekran." />
              <Instruction text="Bëje ushtrimin ngadalë dhe me kontroll." />
              <View style={styles.safetyBox}>
                <Text style={styles.safetyText}>AI mat vetëm cilësinë e lëvizjes. Nuk diagnostikon dhe nuk ndryshon planin.</Text>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('ai-checking')} activeOpacity={0.86}>
                <Text style={styles.primaryButtonText}>Fillo kontrollin</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {screen === 'ai-checking' && (
          <View style={styles.darkScreen}>
            <Text style={styles.darkSmall}>{selectedExercise?.name}</Text>
            <View style={styles.cameraFrame}><Text style={styles.cameraBody}>◎</Text></View>
            {!isAnalyzing ? (
              <>
                <Text style={styles.countdownHint}>Fillo ushtrimin...</Text>
                <Text style={styles.countdown}>{countdown}</Text>
              </>
            ) : (
              <>
                <ActivityIndicator color="#34C759" size="large" />
                <Text style={styles.analyzing}>Duke analizuar lëvizjen...</Text>
              </>
            )}
          </View>
        )}

        {screen === 'ai-result' && (
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
            {saving && <ActivityIndicator color="#0F8F86" style={{ marginTop: 16 }} />}
          </View>
        )}

        {screen === 'pain-warning' && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>!</Text>
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

function Header({ onHome, onlineMode }: { onHome: () => void; onlineMode: boolean }) {
  return (
    <TouchableOpacity style={styles.header} onPress={onHome} activeOpacity={0.8}>
      <View style={styles.headerLogo}><Text style={styles.headerLogoText}>FI</Text></View>
      <View>
        <Text style={styles.headerTitle}>Fizioterapia ime</Text>
        <Text style={styles.headerSubtitle}>{onlineMode ? 'Live · Supabase' : 'Demo / offline fallback'}</Text>
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

const palette = {
  primary: '#0F8F86',
  primaryStrong: '#0B6F68',
  primarySoft: '#E8F7F6',
  secondary: '#34C759',
  secondarySoft: '#EAF8F1',
  ink: '#0F172A',
  inkSoft: '#102033',
  muted: '#486276',
  muted2: '#64748B',
  surface: '#FFFFFF',
  surfaceSoft: '#F7FAFC',
  line: '#E2E8F0',
  warningSoft: '#FFF7ED',
  warning: '#92400E',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
};

const softShadow = {
  shadowColor: '#0F2033',
  shadowOpacity: 0.08,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 3,
};

const liftShadow = {
  shadowColor: '#0F2033',
  shadowOpacity: 0.12,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 14 },
  elevation: 5,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.surfaceSoft },
  container: { padding: 18, paddingBottom: 42 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, marginTop: 4 },
  headerLogo: { width: 46, height: 46, borderRadius: 16, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  headerLogoText: { color: palette.surface, fontWeight: '900', fontSize: 18 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: palette.inkSoft, letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 13, color: palette.muted2, marginTop: 2, fontWeight: '700' },
  heroBlue: { backgroundColor: palette.inkSoft, borderRadius: 32, padding: 28, alignItems: 'center', marginBottom: -18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  logoMark: { width: 76, height: 76, borderRadius: 38, backgroundColor: palette.surface, color: palette.primaryStrong, textAlign: 'center', textAlignVertical: 'center', fontSize: 28, fontWeight: '900', overflow: 'hidden', marginBottom: 14 },
  heroTitle: { color: palette.surface, fontSize: 30, fontWeight: '900', letterSpacing: -0.7 },
  heroText: { color: 'rgba(255,255,255,0.82)', fontSize: 15, marginTop: 8, textAlign: 'center', lineHeight: 21, fontWeight: '700' },
  card: { backgroundColor: palette.surface, borderRadius: 28, padding: 22, borderWidth: 1, borderColor: palette.line, ...softShadow },
  cardLifted: { backgroundColor: palette.surface, borderRadius: 30, padding: 24, borderWidth: 1, borderColor: palette.line, ...liftShadow },
  title: { fontSize: 29, lineHeight: 34, fontWeight: '900', color: palette.ink, letterSpacing: -0.8, marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 25, color: palette.muted, marginBottom: 16 },
  smallText: { fontSize: 13, lineHeight: 18, color: palette.muted2, fontWeight: '700' },
  helper: { fontSize: 13, color: palette.muted2, marginTop: 10, textAlign: 'center', fontWeight: '800' },
  eyebrow: { color: palette.primaryStrong, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: 'rgba(15,143,134,0.22)', borderRadius: 20, paddingHorizontal: 14, backgroundColor: palette.surface, marginBottom: 12 },
  inputIcon: { width: 30, height: 30, borderRadius: 12, backgroundColor: palette.primarySoft, color: palette.primaryStrong, textAlign: 'center', textAlignVertical: 'center', fontSize: 18, fontWeight: '900', overflow: 'hidden' },
  input: { flex: 1, paddingVertical: 17, fontSize: 19, color: palette.inkSoft, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  error: { color: '#991B1B', backgroundColor: palette.dangerSoft, borderWidth: 1, borderColor: 'rgba(220,38,38,0.22)', borderRadius: 16, padding: 12, marginBottom: 12, fontWeight: '800' },
  primaryButton: { backgroundColor: palette.primary, borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'center', marginTop: 10, shadowColor: palette.primary, shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 3 },
  primaryButtonText: { color: palette.surface, fontSize: 17, fontWeight: '900' },
  secondaryButton: { backgroundColor: palette.primarySoft, borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: 'rgba(15,143,134,0.16)' },
  secondaryButtonText: { color: palette.primaryStrong, fontSize: 17, fontWeight: '900' },
  planHeader: { backgroundColor: palette.inkSoft, borderRadius: 30, padding: 22, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 14, ...softShadow },
  whiteSmall: { color: 'rgba(255,255,255,0.74)', fontSize: 13, fontWeight: '800' },
  whiteTitle: { color: palette.surface, fontSize: 26, fontWeight: '900', marginTop: 2, letterSpacing: -0.5 },
  whiteText: { color: 'rgba(255,255,255,0.84)', fontSize: 14, marginTop: 6, maxWidth: 230, lineHeight: 20, fontWeight: '700' },
  dayBadge: { backgroundColor: palette.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  dayBadgeText: { color: palette.primaryStrong, fontWeight: '900' },
  progressCard: { backgroundColor: palette.surface, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: palette.line, marginBottom: 14, ...softShadow },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { color: palette.inkSoft, fontWeight: '900', fontSize: 15 },
  progressPercent: { color: palette.primaryStrong, fontWeight: '900', fontSize: 21 },
  progressTrack: { height: 10, backgroundColor: palette.primarySoft, borderRadius: 99, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: palette.secondary, borderRadius: 99 },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: palette.ink, marginVertical: 12, letterSpacing: -0.4 },
  exerciseCard: { backgroundColor: palette.surface, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, borderWidth: 1, borderColor: palette.line, ...softShadow },
  exerciseDone: { backgroundColor: palette.secondarySoft, borderColor: 'rgba(22,163,74,0.22)' },
  exerciseIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  exerciseIconDone: { backgroundColor: '#16A34A' },
  exerciseIconText: { fontSize: 20, fontWeight: '900', color: palette.surface },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: palette.ink, fontSize: 17, fontWeight: '900', marginBottom: 3 },
  aiMini: { color: palette.primaryStrong, fontSize: 12, fontWeight: '900', marginTop: 4 },
  chevron: { color: '#94A3B8', fontSize: 32, fontWeight: '300' },
  back: { color: palette.primaryStrong, fontWeight: '900', marginBottom: 12, fontSize: 16 },
  videoBox: { height: 160, borderRadius: 24, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  videoIcon: { color: palette.surface, fontSize: 34, marginBottom: 8 },
  videoText: { color: 'rgba(255,255,255,0.82)', fontWeight: '800' },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  infoPill: { flex: 1, backgroundColor: palette.surfaceSoft, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: palette.line },
  infoLabel: { color: palette.muted2, fontSize: 12, fontWeight: '800' },
  infoValue: { color: palette.inkSoft, fontSize: 14, fontWeight: '900', marginTop: 4 },
  safetyBox: { backgroundColor: palette.warningSoft, borderWidth: 1, borderColor: 'rgba(245,158,11,0.24)', borderRadius: 18, padding: 14, marginVertical: 12 },
  safetyText: { color: palette.warning, fontWeight: '850', lineHeight: 21 },
  cameraPrepBox: { backgroundColor: palette.primarySoft, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: 'rgba(15,143,134,0.16)' },
  cameraEmoji: { width: 64, height: 64, borderRadius: 24, backgroundColor: palette.surface, color: palette.primaryStrong, textAlign: 'center', textAlignVertical: 'center', fontSize: 40, fontWeight: '900', overflow: 'hidden', marginBottom: 8 },
  textCenter: { color: palette.muted, fontWeight: '800', textAlign: 'center', lineHeight: 21 },
  instruction: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  check: { color: palette.primaryStrong, fontSize: 16, fontWeight: '900' },
  instructionText: { color: palette.muted, fontSize: 15, lineHeight: 22, flex: 1 },
  darkScreen: { backgroundColor: '#07111F', borderRadius: 30, padding: 22, minHeight: 560, alignItems: 'center', justifyContent: 'center' },
  darkSmall: { color: 'rgba(255,255,255,0.74)', fontWeight: '900', marginBottom: 18 },
  cameraFrame: { width: '100%', height: 310, borderRadius: 28, borderWidth: 2, borderColor: palette.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  cameraBody: { color: palette.secondary, fontSize: 90 },
  countdownHint: { color: 'rgba(255,255,255,0.82)', fontSize: 16, marginBottom: 8, fontWeight: '800' },
  countdown: { color: palette.surface, fontSize: 58, fontWeight: '900' },
  analyzing: { color: palette.surface, marginTop: 12, fontWeight: '800' },
  resultCard: { backgroundColor: palette.surface, borderRadius: 30, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: palette.line, ...softShadow },
  score: { color: palette.primaryStrong, fontSize: 66, fontWeight: '900', marginBottom: 4, letterSpacing: -1.2 },
  resultBadge: { backgroundColor: palette.secondarySoft, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(22,163,74,0.18)' },
  resultBadgeText: { color: '#166534', fontWeight: '900' },
  painGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  painButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(15,143,134,0.16)' },
  painText: { color: palette.primaryStrong, fontWeight: '900', fontSize: 18 },
  warningCard: { backgroundColor: palette.warningSoft, borderColor: 'rgba(245,158,11,0.28)', borderWidth: 1, borderRadius: 30, padding: 24, alignItems: 'center' },
  warningIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F59E0B', color: palette.surface, textAlign: 'center', textAlignVertical: 'center', fontSize: 40, fontWeight: '900', overflow: 'hidden', marginBottom: 10 },
  savedIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: palette.primary, color: palette.surface, textAlign: 'center', textAlignVertical: 'center', fontSize: 38, fontWeight: '900', overflow: 'hidden', marginBottom: 14 },
});
