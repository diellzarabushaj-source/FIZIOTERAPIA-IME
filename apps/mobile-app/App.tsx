import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  clearPatientSessionLocally,
  loginPatientWithCode,
  logoutPatientSession,
  MobileApiError,
  saveMobileProgress,
  type MobileExercise,
  type MobilePatient,
} from './lib/api';
import {
  MOBILE_PAIN_MAX,
  MOBILE_PAIN_MIN,
  mustStopExerciseForPain,
} from './lib/clinical-safety';

type Screen = 'login' | 'plan' | 'exercise' | 'pain' | 'pain-warning' | 'saved';

const painScores = Array.from(
  { length: MOBILE_PAIN_MAX - MOBILE_PAIN_MIN + 1 },
  (_, index) => index + MOBILE_PAIN_MIN,
);

function normalizePatientCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '').slice(0, 40);
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
  busy = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function Header({
  signedIn,
  onHome,
  onLogout,
  loggingOut,
}: {
  signedIn: boolean;
  onHome: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kthehu te plani"
        onPress={onHome}
        style={styles.brandButton}
      >
        <View style={styles.logoMark} accessibilityElementsHidden>
          <Text style={styles.logoText}>FI</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>Fizioterapia ime</Text>
          <Text style={styles.brandSubtitle}>Aplikacioni i pacientit</Text>
        </View>
      </Pressable>
      {signedIn ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dil nga sesioni"
          disabled={loggingOut}
          onPress={onLogout}
          style={({ pressed }) => [styles.logoutButton, pressed ? styles.buttonPressed : null]}
        >
          <Text style={styles.logoutText}>{loggingOut ? 'Duke dalë…' : 'Dil'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [code, setCode] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [patient, setPatient] = useState<MobilePatient | null>(null);
  const [planTitle, setPlanTitle] = useState('');
  const [exercises, setExercises] = useState<MobileExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [painScore, setPainScore] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null,
    [exercises, selectedExerciseId],
  );
  const progress = exercises.length
    ? Math.round((completedIds.length / exercises.length) * 100)
    : 0;

  function resetSession() {
    clearPatientSessionLocally();
    setPatient(null);
    setSessionCode('');
    setPlanTitle('');
    setExercises([]);
    setSelectedExerciseId('');
    setCompletedIds([]);
    setPainScore(null);
    setError('');
    setNotice('');
    setScreen('login');
  }

  async function handleLogin() {
    const cleanCode = normalizePatientCode(code);
    setError('');
    setNotice('');

    if (cleanCode.length < 4) {
      setError('Shkruaj kodin e plotë që ta ka dhënë fizioterapisti.');
      return;
    }

    setLoadingLogin(true);
    try {
      const session = await loginPatientWithCode(cleanCode);
      setPatient(session.patient);
      setSessionCode(cleanCode);
      setPlanTitle(session.plan?.title || 'Plani aktiv i fizioterapisë');
      setExercises(session.exercises);
      setSelectedExerciseId(session.exercises[0]?.id || '');
      setCompletedIds(session.completedIds || []);
      setCode('');
      setScreen('plan');
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Hyrja dështoi. Kontrollo kodin dhe lidhjen me internet.',
      );
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutPatientSession();
    } finally {
      setLoggingOut(false);
      resetSession();
    }
  }

  function openExercise(exercise: MobileExercise) {
    setSelectedExerciseId(exercise.id);
    setPainScore(null);
    setError('');
    setNotice('');
    setScreen('exercise');
  }

  function selectPain(score: number) {
    setPainScore(score);
    setError('');
    setNotice('');

    if (mustStopExerciseForPain(score)) {
      setScreen('pain-warning');
      return;
    }

    void savePainResult(score);
  }

  async function savePainResult(score: number) {
    if (!patient || !selectedExercise) {
      setError('Sesioni ose ushtrimi mungon. Hyr përsëri me kod.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await saveMobileProgress({
        code: sessionCode,
        patientId: patient.id,
        planExerciseId: selectedExercise.planExerciseId,
        painScore: score,
      });
      setCompletedIds((current) => Array.from(new Set([...current, selectedExercise.id])));
      setNotice(
        result.painAction === 'stop_and_contact_physio'
          ? 'Dhimbja u raportua. Mos e vazhdo ushtrimin dhe kontakto fizioterapistin.'
          : 'Progresi u ruajt.',
      );
      setScreen('saved');
    } catch (saveError) {
      const message = saveError instanceof Error
        ? saveError.message
        : 'Ruajtja dështoi. Provo përsëri.';
      setError(message);

      if (
        saveError instanceof MobileApiError &&
        ['invalid_or_expired_patient_session', 'patient_session_missing'].includes(saveError.code)
      ) {
        resetSession();
        setError('Sesioni ka skaduar. Hyr përsëri me kod.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header
            signedIn={Boolean(patient)}
            loggingOut={loggingOut}
            onHome={() => setScreen(patient ? 'plan' : 'login')}
            onLogout={() => void handleLogout()}
          />

          {error ? (
            <View accessibilityLiveRegion="assertive" style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {screen === 'login' ? (
            <View>
              <View style={styles.hero}>
                <Text style={styles.eyebrowLight}>PILOT PËR PACIENTË</Text>
                <Text style={styles.heroTitle}>Plani yt, i qartë dhe i sigurt.</Text>
                <Text style={styles.heroText}>
                  Hyr me kodin e dhënë nga fizioterapisti. Aplikacioni nuk cakton diagnozë dhe nuk ndryshon planin tënd.
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Hyr me kodin e pacientit</Text>
                <Text style={styles.paragraph}>
                  Kodi është personal. Mos e ndaj me persona të tjerë.
                </Text>
                <TextInput
                  accessibilityLabel="Kodi i pacientit"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!loadingLogin}
                  maxLength={40}
                  onChangeText={(value) => setCode(normalizePatientCode(value))}
                  onSubmitEditing={() => void handleLogin()}
                  placeholder="P.sh. FI-AB12CD"
                  returnKeyType="go"
                  style={styles.input}
                  value={code}
                />
                <PrimaryButton
                  busy={loadingLogin}
                  disabled={loadingLogin || code.length < 4}
                  label="Hyr në plan"
                  onPress={() => void handleLogin()}
                />
              </View>
            </View>
          ) : null}

          {screen === 'plan' && patient ? (
            <View>
              <View style={styles.card}>
                <Text style={styles.eyebrow}>PACIENTI</Text>
                <Text style={styles.sectionTitle}>{patient.name}</Text>
                <Text style={styles.paragraph}>{patient.diagnosis}</Text>
                <View style={styles.divider} />
                <Text style={styles.planTitle}>{planTitle}</Text>
                <Text style={styles.progressLabel}>{progress}% e ushtrimeve të sotme</Text>
                <View
                  accessibilityLabel={`${progress}% e ushtrimeve të përfunduara`}
                  accessibilityRole="progressbar"
                  style={styles.progressTrack}
                >
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
              </View>

              {exercises.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Nuk ka ushtrime aktive</Text>
                  <Text style={styles.paragraph}>
                    Kontakto fizioterapistin nëse prisje një plan ose një ushtrim të ri.
                  </Text>
                </View>
              ) : (
                exercises.map((exercise) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Hap ushtrimin ${exercise.name}`}
                    key={exercise.id}
                    onPress={() => openExercise(exercise)}
                    style={({ pressed }) => [
                      styles.exerciseCard,
                      pressed ? styles.buttonPressed : null,
                    ]}
                  >
                    <View style={styles.exerciseMain}>
                      <Text style={styles.exerciseTitle}>
                        {completedIds.includes(exercise.id) ? '✓ ' : ''}
                        {exercise.name}
                      </Text>
                      <Text style={styles.exerciseMeta}>
                        {exercise.meta} · {exercise.duration}
                      </Text>
                    </View>
                    <Text accessibilityElementsHidden style={styles.arrow}>›</Text>
                  </Pressable>
                ))
              )}
            </View>
          ) : null}

          {screen === 'exercise' && selectedExercise ? (
            <View style={styles.card}>
              <Text style={styles.eyebrow}>USHTRIMI</Text>
              <Text style={styles.sectionTitle}>{selectedExercise.name}</Text>
              <Text style={styles.exerciseMeta}>
                {selectedExercise.meta} · {selectedExercise.duration}
              </Text>
              <Text style={styles.paragraph}>{selectedExercise.instructions}</Text>

              {selectedExercise.aiEnabled ? (
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>AI Movement Check</Text>
                  <Text style={styles.infoText}>
                    Ky pilot mobile nuk aktivizon kamerën dhe nuk prodhon rezultat të simuluar. Kontrolli i lëvizjes përdoret vetëm në portalin ku MediaPipe dhe pëlqimi për kamerën janë aktivë.
                  </Text>
                </View>
              ) : null}

              <PrimaryButton
                label="Përfundova ushtrimin"
                onPress={() => setScreen('pain')}
              />
              <SecondaryButton label="Kthehu te plani" onPress={() => setScreen('plan')} />
            </View>
          ) : null}

          {screen === 'pain' && selectedExercise ? (
            <View style={styles.card}>
              <Text style={styles.eyebrow}>PAS USHTRIMIT</Text>
              <Text style={styles.sectionTitle}>Sa ishte dhimbja?</Text>
              <Text style={styles.paragraph}>
                Zgjidh një numër nga 0 pa dhimbje deri në 10 dhimbja më e fortë.
              </Text>
              <View style={styles.painGrid}>
                {painScores.map((score) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Dhimbja ${score} nga 10`}
                    disabled={saving}
                    key={score}
                    onPress={() => selectPain(score)}
                    style={({ pressed }) => [
                      styles.painButton,
                      score >= 7 ? styles.painButtonDanger : null,
                      pressed ? styles.buttonPressed : null,
                    ]}
                  >
                    <Text style={score >= 7 ? styles.painTextDanger : styles.painText}>{score}</Text>
                  </Pressable>
                ))}
              </View>
              {saving ? <ActivityIndicator color="#30B5A8" style={styles.loader} /> : null}
              <SecondaryButton label="Kthehu te ushtrimi" onPress={() => setScreen('exercise')} />
            </View>
          ) : null}

          {screen === 'pain-warning' && painScore !== null ? (
            <View style={[styles.card, styles.warningCard]}>
              <Text style={styles.warningEyebrow}>NDALO USHTRIMIN</Text>
              <Text style={styles.sectionTitle}>Dhimbja {painScore}/10 kërkon kujdes.</Text>
              <Text style={styles.paragraph}>
                Mos e vazhdo ushtrimin. Raportoje dhimbjen dhe kontakto fizioterapistin përgjegjës. Ky udhëzim nuk është diagnozë dhe nuk zëvendëson vlerësimin profesional.
              </Text>
              <PrimaryButton
                busy={saving}
                disabled={saving}
                label="Ruaj raportimin"
                onPress={() => void savePainResult(painScore)}
              />
              <SecondaryButton
                disabled={saving}
                label="Ndrysho vlerën"
                onPress={() => setScreen('pain')}
              />
            </View>
          ) : null}

          {screen === 'saved' ? (
            <View style={styles.card}>
              <Text style={styles.successMark}>✓</Text>
              <Text style={styles.sectionTitle}>U ruajt</Text>
              <Text accessibilityLiveRegion="polite" style={styles.paragraph}>
                {notice || 'Progresi u ruajt.'}
              </Text>
              <PrimaryButton label="Kthehu te plani" onPress={() => setScreen('plan')} />
            </View>
          ) : null}

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Fizioterapia ime është mjet përcjellës. Plani dhe udhëzimet vijnë vetëm nga profesionisti përgjegjës.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  container: { paddingHorizontal: 18, paddingBottom: 32, width: '100%', maxWidth: 720, alignSelf: 'center' },
  header: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brandButton: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  logoMark: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#30B5A8' },
  logoText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  brandTitle: { color: '#111111', fontSize: 16, fontWeight: '800' },
  brandSubtitle: { color: '#6E6E73', fontSize: 12, marginTop: 2 },
  logoutButton: { minHeight: 44, minWidth: 52, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: '#E6EEF8', backgroundColor: '#FFFFFF' },
  logoutText: { color: '#111111', fontWeight: '700' },
  hero: { backgroundColor: '#30B5A8', borderRadius: 28, padding: 24, marginBottom: 16 },
  eyebrowLight: { color: '#E9FFFC', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  heroTitle: { color: '#FFFFFF', fontSize: 32, lineHeight: 38, fontWeight: '900', marginBottom: 12 },
  heroText: { color: '#F4FFFD', fontSize: 16, lineHeight: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E6EEF8', marginBottom: 14 },
  warningCard: { borderColor: '#FFD2CE', backgroundColor: '#FFF8F7' },
  eyebrow: { color: '#30B5A8', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8 },
  warningEyebrow: { color: '#FF3B30', fontSize: 12, fontWeight: '900', letterSpacing: 1.1, marginBottom: 8 },
  sectionTitle: { color: '#111111', fontSize: 24, lineHeight: 30, fontWeight: '800', marginBottom: 10 },
  planTitle: { color: '#111111', fontSize: 18, lineHeight: 24, fontWeight: '800', marginBottom: 10 },
  paragraph: { color: '#6E6E73', fontSize: 16, lineHeight: 24, marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#E6EEF8', marginVertical: 4, marginBottom: 16 },
  input: { minHeight: 54, borderRadius: 16, borderWidth: 1.5, borderColor: '#C8D7E8', backgroundColor: '#FFFFFF', paddingHorizontal: 16, color: '#111111', fontSize: 18, fontWeight: '700', letterSpacing: 1, marginBottom: 14 },
  primaryButton: { minHeight: 54, borderRadius: 16, backgroundColor: '#34C759', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: '#C8D7E8', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 10 },
  secondaryButtonText: { color: '#111111', fontSize: 15, fontWeight: '700' },
  buttonPressed: { opacity: 0.72 },
  buttonDisabled: { opacity: 0.48 },
  errorBox: { borderRadius: 16, borderWidth: 1, borderColor: '#FFD2CE', backgroundColor: '#FFF0EF', padding: 14, marginBottom: 14 },
  errorText: { color: '#B42318', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  progressLabel: { color: '#6E6E73', fontSize: 14, marginBottom: 8 },
  progressTrack: { height: 10, borderRadius: 99, backgroundColor: '#EAF5F3', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 99, backgroundColor: '#34C759' },
  exerciseCard: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E6EEF8', padding: 18, marginBottom: 10 },
  exerciseMain: { flex: 1 },
  exerciseTitle: { color: '#111111', fontSize: 17, lineHeight: 22, fontWeight: '800', marginBottom: 5 },
  exerciseMeta: { color: '#6E6E73', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  arrow: { color: '#30B5A8', fontSize: 30, fontWeight: '500' },
  infoBox: { backgroundColor: '#F2F7F7', borderRadius: 18, padding: 16, marginBottom: 14 },
  infoTitle: { color: '#111111', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  infoText: { color: '#6E6E73', fontSize: 14, lineHeight: 21 },
  painGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 12 },
  painButton: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#C8D7E8', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  painButtonDanger: { borderColor: '#FFD2CE', backgroundColor: '#FFF0EF' },
  painText: { color: '#111111', fontSize: 17, fontWeight: '800' },
  painTextDanger: { color: '#B42318', fontSize: 17, fontWeight: '900' },
  loader: { marginVertical: 10 },
  successMark: { color: '#34C759', fontSize: 52, lineHeight: 58, fontWeight: '900', marginBottom: 8 },
  footerNote: { paddingHorizontal: 8, paddingVertical: 12 },
  footerText: { color: '#6E6E73', textAlign: 'center', fontSize: 12, lineHeight: 18 },
});
