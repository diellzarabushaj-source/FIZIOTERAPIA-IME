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

function getAlertLabel(alertType: AlertType) {
  if (alertType === 'good') return 'Lëvizje e mirë';
  if (alertType === 'needs_attention') return 'Duhet më shumë kujdes';
  return 'Kontakto fizioterapeutin';
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
  const [painComment, setPainComment] = useState('');
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
    let analysisTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setIsAnalyzing(true);
        analysisTimeout = setTimeout(() => {
          setIsAnalyzing(false);
          setScreen('ai-result');
        }, 1800);
      }
    }, 900);

    return () => {
      clearInterval(interval);
      if (analysisTimeout) clearTimeout(analysisTimeout);
    };
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
    setPainComment('');
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
          feedback: `${aiFeedback.join(' ')} ${painComment ? `Koment: ${painComment}` : ''}`.trim(),
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
  }

  function confirmPain() {
    if (painScore === null) return;
    if (painScore >= 7) {
      setScreen('pain-warning');
    } else {
      void saveResult(painScore);
    }
  }

  const showShell = screen !== 'login' && screen !== 'ai-checking';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={screen === 'ai-checking' ? 'light' : 'dark'} />
      <View style={styles.appFrame}>
        {showShell && <Header onHome={() => setScreen('plan')} onlineMode={onlineMode} />}
        <ScrollView contentContainerStyle={[styles.container, screen === 'ai-checking' && styles.darkContainer]} showsVerticalScrollIndicator={false}>
          {screen === 'login' && (
            <View style={styles.loginScreen}>
              <View style={styles.loginAura} />
              <View style={styles.loginHero}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoText}>FP</Text>
                </View>
                <Text style={styles.brandTitle}>FizioPlan</Text>
                <Text style={styles.brandSubtitle}>Plani juaj i fizioterapisë</Text>
              </View>

              <View style={styles.loginCard}>
                <Text style={styles.eyebrow}>Hyrje për pacientin</Text>
                <Text style={styles.loginTitle}>Hyr me kodin e pacientit</Text>
                <Text style={styles.loginText}>Kodi merret nga fizioterapeuti juaj. Plani dhe ushtrimet janë të personalizuara për ju.</Text>

                <Text style={styles.fieldLabel}>Kodi i pacientit</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    style={styles.input}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    placeholder="p.sh. ARB-4821"
                    placeholderTextColor="#8AA0B3"
                    onSubmitEditing={() => void handleLogin()}
                  />
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={styles.primaryButton} onPress={() => void handleLogin()} activeOpacity={0.86} disabled={loadingLogin}>
                  <Text style={styles.primaryButtonText}>{loadingLogin ? 'Duke hyrë...' : 'Hyr në planin tim'}</Text>
                </TouchableOpacity>
                {loadingLogin && <ActivityIndicator color="#2D9E5F" style={{ marginTop: 14 }} />}
                <Text style={styles.trustText}>I sigurt • I thjeshtë • I personalizuar</Text>
                <Text style={styles.helper}>Demo code: ARB-4821</Text>
              </View>
            </View>
          )}

          {screen === 'plan' && (
            <View>
              <View style={styles.dashboardHero}>
                <View style={styles.heroTopRow}>
                  <View>
                    <Text style={styles.whiteSmall}>Mirë se erdhe</Text>
                    <Text style={styles.whiteTitle}>{currentPatient.name}</Text>
                  </View>
                  <View style={styles.modePill}>
                    <Text style={styles.modePillText}>{onlineMode ? 'Live' : 'Demo'}</Text>
                  </View>
                </View>
                <View style={styles.planGlassCard}>
                  <Text style={styles.planLabel}>Plani aktiv</Text>
                  <Text style={styles.planTitle}>{planTitle}</Text>
                  <Text style={styles.planMeta}>Sot • {exercises.length} ushtrime • kontroll i sigurt</Text>
                </View>
              </View>

              <View style={styles.progressCard}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.progressTitle}>Ushtrime të kryera sot</Text>
                    <Text style={styles.progressSub}>{completedIds.length}/{exercises.length} ushtrime të kryera</Text>
                  </View>
                  <Text style={styles.progressPercent}>{progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>

              <View style={styles.safetyBox}>
                <View style={styles.safetyIcon}><Text style={styles.safetyIconText}>!</Text></View>
                <Text style={styles.safetyText}>Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.</Text>
              </View>

              <Text style={styles.sectionTitle}>Ushtrimet për sot</Text>
              {exercises.map((exercise, index) => {
                const completed = completedIds.includes(exercise.id);
                return (
                  <TouchableOpacity key={exercise.id} style={[styles.exerciseCard, completed && styles.exerciseDone]} onPress={() => openExercise(exercise)} activeOpacity={0.82}>
                    <View style={[styles.exerciseIcon, completed && styles.exerciseIconDone]}>
                      <Text style={[styles.exerciseIconText, completed && styles.exerciseIconTextDone]}>{completed ? '✓' : index + 1}</Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <View style={styles.exerciseTitleRow}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <View style={completed ? styles.doneBadge : styles.todayBadge}>
                          <Text style={completed ? styles.doneBadgeText : styles.todayBadgeText}>{completed ? 'Kryer' : 'Sot'}</Text>
                        </View>
                      </View>
                      <Text style={styles.smallText}>{exercise.meta} · {exercise.duration}</Text>
                      <View style={styles.cardMetaRow}>
                        <Text style={styles.metaChip}>Lehtë</Text>
                        {exercise.aiEnabled && <Text style={styles.aiMini}>AI check</Text>}
                      </View>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {screen === 'exercise' && selectedExercise && (
            <View>
              <BackButton label="Kthehu te plani" onPress={() => setScreen('plan')} />
              <View style={styles.exerciseHeroCard}>
                <Text style={styles.eyebrow}>Ushtrimi</Text>
                <Text style={styles.title}>{selectedExercise.name}</Text>
                <View style={styles.videoBox}>
                  <View style={styles.playCircle}><Text style={styles.videoIcon}>▶</Text></View>
                  <Text style={styles.videoText}>{selectedExercise.videoUrl ? 'Video udhëzuese' : 'Udhëzim nga fizioterapeuti'}</Text>
                  <Text style={styles.videoSubText}>Shikoje lëvizjen para se ta fillosh ushtrimin.</Text>
                </View>

                <View style={styles.infoGrid}>
                  <InfoPill label="Sete / përsëritje" value={selectedExercise.meta} />
                  <InfoPill label="Kohëzgjatja" value={selectedExercise.duration} />
                </View>

                <View style={styles.instructionsCard}>
                  <Text style={styles.instructionsTitle}>Udhëzime</Text>
                  <Text style={styles.text}>{selectedExercise.instructions}</Text>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('pain')} activeOpacity={0.86}>
                  <Text style={styles.primaryButtonText}>E përfundova ushtrimin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('pain')} activeOpacity={0.86}>
                  <Text style={styles.secondaryButtonText}>Raporto dhimbjen</Text>
                </TouchableOpacity>
                {selectedExercise.aiEnabled && (
                  <TouchableOpacity style={styles.aiButton} onPress={() => setScreen('ai-prep')} activeOpacity={0.86}>
                    <Text style={styles.aiButtonText}>Kontrollo lëvizjen me kamerë</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {screen === 'ai-prep' && (
            <View>
              <BackButton label="Kthehu te ushtrimi" onPress={() => setScreen('exercise')} />
              <View style={styles.card}>
                <Text style={styles.eyebrow}>AI Movement Check</Text>
                <Text style={styles.title}>Përgatitu për kontrollin me kamerë</Text>
                <View style={styles.cameraPrepBox}>
                  <View style={styles.phoneMock}>
                    <Text style={styles.phoneMockText}>📱</Text>
                  </View>
                  <Text style={styles.textCenter}>Vendose telefonin në mënyrë që trupi të shihet qartë.</Text>
                </View>
                <Instruction text="Vendose telefonin në një vend stabil." />
                <Instruction text="Trupi duhet të shihet qartë në ekran." />
                <Instruction text="Bëje ushtrimin ngadalë dhe me kontroll." />
                <View style={styles.safetyBox}>
                  <View style={styles.safetyIcon}><Text style={styles.safetyIconText}>i</Text></View>
                  <Text style={styles.safetyText}>AI mat vetëm cilësinë e lëvizjes. Nuk diagnostikon, nuk përshkruan ushtrime dhe nuk ndryshon planin.</Text>
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
              <Text style={styles.darkTitle}>Kontrolli me kamerë</Text>
              <View style={styles.cameraFrame}>
                <View style={styles.poseHead} />
                <View style={styles.poseBody} />
                <View style={styles.poseArmLeft} />
                <View style={styles.poseArmRight} />
                <View style={styles.poseLegLeft} />
                <View style={styles.poseLegRight} />
                <Text style={styles.cameraGuide}>Trupi në qendër</Text>
              </View>
              {!isAnalyzing ? (
                <>
                  <Text style={styles.countdownHint}>Fillo ushtrimin ngadalë...</Text>
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
            <View style={styles.resultCard}>
              <Text style={styles.eyebrow}>Rezultati i AI</Text>
              <View style={styles.scoreRing}>
                <Text style={styles.score}>{aiScore}%</Text>
                <Text style={styles.scoreLabel}>cilësi</Text>
              </View>
              <Text style={styles.title}>{getAlertLabel(alertType)}</Text>
              <View style={styles.resultBadge}><Text style={styles.resultBadgeText}>{getAlertLabel(alertType)}</Text></View>
              <View style={styles.feedbackList}>
                {aiFeedback.map((item) => <FeedbackCard key={item} text={item} />)}
              </View>
              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>Ky feedback nuk e zëvendëson vlerësimin e fizioterapeutit.</Text>
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
              <Text style={styles.text}>Zgjedh një vlerë nga 0 deri në 10. Nëse dhimbja është 7 ose më shumë, ndalo ushtrimin dhe kontakto fizioterapeutin.</Text>
              <View style={styles.painGrid}>
                {Array.from({ length: 11 }, (_, index) => (
                  <TouchableOpacity key={index} style={[styles.painButton, painScore === index && styles.painButtonSelected, index >= 7 && styles.painButtonWarning]} onPress={() => selectPain(index)} activeOpacity={0.8}>
                    <Text style={[styles.painText, painScore === index && styles.painTextSelected]}>{index}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {painScore !== null && painScore >= 7 && (
                <View style={styles.warningInline}>
                  <Text style={styles.warningInlineText}>Ndalo ushtrimin dhe kontakto fizioterapeutin.</Text>
                </View>
              )}
              <TextInput
                value={painComment}
                onChangeText={setPainComment}
                style={styles.commentInput}
                placeholder="Koment opsional për fizioterapeutin"
                placeholderTextColor="#8AA0B3"
                multiline
              />
              <TouchableOpacity style={[styles.primaryButton, painScore === null && styles.disabledButton]} onPress={confirmPain} activeOpacity={0.86} disabled={painScore === null || saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Duke ruajtur...' : 'Vazhdo'}</Text>
              </TouchableOpacity>
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
            <View style={styles.cardCentered}>
              <Text style={styles.savedIcon}>✓</Text>
              <Text style={styles.title}>U ruajt kontrolli</Text>
              <Text style={styles.textCenterMuted}>{saveText || 'Rezultati u ruajt.'}</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('plan')} activeOpacity={0.86}>
                <Text style={styles.primaryButtonText}>Kthehu te plani</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        {showShell && <BottomNav current="Plani" onPlan={() => setScreen('plan')} />}
      </View>
    </SafeAreaView>
  );
}

function Header({ onHome, onlineMode }: { onHome: () => void; onlineMode: boolean }) {
  return (
    <TouchableOpacity style={styles.header} onPress={onHome} activeOpacity={0.8}>
      <View style={styles.headerLogo}><Text style={styles.headerLogoText}>FP</Text></View>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>FizioPlan</Text>
        <Text style={styles.headerSubtitle}>{onlineMode ? 'Live · Supabase' : 'Demo i sigurt'}</Text>
      </View>
      <Text style={styles.headerStatus}>●</Text>
    </TouchableOpacity>
  );
}

function BottomNav({ current, onPlan }: { current: string; onPlan: () => void }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItemActive} onPress={onPlan} activeOpacity={0.82}>
        <Text style={styles.navIcon}>⌂</Text>
        <Text style={styles.navTextActive}>{current}</Text>
      </TouchableOpacity>
      <View style={styles.navItem}><Text style={styles.navIconMuted}>☰</Text><Text style={styles.navText}>Ushtrimet</Text></View>
      <View style={styles.navItem}><Text style={styles.navIconMuted}>✉</Text><Text style={styles.navText}>Mesazhet</Text></View>
      <View style={styles.navItem}><Text style={styles.navIconMuted}>○</Text><Text style={styles.navText}>Profili</Text></View>
    </View>
  );
}

function BackButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.backButton}>
      <Text style={styles.back}>‹ {label}</Text>
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

function FeedbackCard({ text }: { text: string }) {
  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackIcon}>✓</Text>
      <Text style={styles.feedbackText}>{text}</Text>
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
  safe: { flex: 1, backgroundColor: '#F3F9FD' },
  appFrame: { flex: 1, backgroundColor: '#F3F9FD' },
  container: { padding: 18, paddingBottom: 112 },
  darkContainer: { paddingBottom: 32 },
  loginScreen: { minHeight: 760, paddingTop: 18 },
  loginAura: { position: 'absolute', top: -120, left: -70, right: -70, height: 330, borderBottomLeftRadius: 160, borderBottomRightRadius: 160, backgroundColor: '#DDF0FF' },
  loginHero: { alignItems: 'center', paddingTop: 34, paddingBottom: 22 },
  logoCircle: { width: 86, height: 86, borderRadius: 30, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#134162', shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 5 },
  logoText: { color: '#2167A8', fontWeight: '900', fontSize: 30, letterSpacing: -1 },
  brandTitle: { color: '#102033', fontSize: 38, fontWeight: '900', letterSpacing: -1.2, marginTop: 16 },
  brandSubtitle: { color: '#496175', fontSize: 17, fontWeight: '700', marginTop: 5 },
  loginCard: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: 16 }, elevation: 6 },
  loginTitle: { fontSize: 29, lineHeight: 34, fontWeight: '900', color: '#102033', letterSpacing: -0.7, marginBottom: 10 },
  loginText: { fontSize: 16, lineHeight: 24, color: '#496175', marginBottom: 20 },
  trustText: { color: '#2D9E5F', fontSize: 14, fontWeight: '900', textAlign: 'center', marginTop: 15 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 18, marginTop: 8, marginBottom: 2, padding: 12, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCEAF2' },
  headerLogo: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#2167A8', alignItems: 'center', justifyContent: 'center' },
  headerLogoText: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#102033', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, color: '#6B7A90', marginTop: 2, fontWeight: '700' },
  headerStatus: { color: '#2D9E5F', fontSize: 16 },
  dashboardHero: { backgroundColor: '#2167A8', borderRadius: 32, padding: 22, marginTop: 12, marginBottom: 16, shadowColor: '#134162', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 5 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' },
  whiteSmall: { color: 'rgba(255,255,255,0.78)', fontSize: 14, fontWeight: '800' },
  whiteTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 3, letterSpacing: -0.7 },
  modePill: { backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  modePillText: { color: '#2167A8', fontWeight: '900' },
  planGlassCard: { marginTop: 22, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 24, padding: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  planLabel: { color: 'rgba(255,255,255,0.76)', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  planTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 27, fontWeight: '900', marginTop: 7 },
  planMeta: { color: 'rgba(255,255,255,0.82)', fontWeight: '700', marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 22, borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.08, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 3 },
  cardCentered: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.08, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 3 },
  exerciseHeroCard: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 22, borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.09, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '900', color: '#102033', letterSpacing: -0.6, marginBottom: 12 },
  text: { fontSize: 16, lineHeight: 24, color: '#496175', marginBottom: 16 },
  textCenter: { color: '#496175', fontWeight: '800', textAlign: 'center', lineHeight: 22, marginTop: 10 },
  textCenterMuted: { color: '#496175', fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 16 },
  smallText: { fontSize: 13, lineHeight: 18, color: '#6B7A90', fontWeight: '700' },
  helper: { fontSize: 13, color: '#6B7A90', marginTop: 10, textAlign: 'center' },
  eyebrow: { color: '#2167A8', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  fieldLabel: { color: '#102033', fontWeight: '900', marginBottom: 8, fontSize: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#D1E5F8', borderRadius: 18, paddingHorizontal: 14, backgroundColor: '#FBFDFF', marginBottom: 12 },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, paddingVertical: 17, fontSize: 18, color: '#102033', fontWeight: '900', letterSpacing: 1.2 },
  commentInput: { minHeight: 86, borderWidth: 1.5, borderColor: '#DCEAF2', borderRadius: 20, padding: 15, color: '#102033', fontSize: 15, backgroundColor: '#FBFDFF', textAlignVertical: 'top', marginTop: 16 },
  error: { color: '#B42318', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 14, padding: 12, marginBottom: 12, fontWeight: '800' },
  primaryButton: { backgroundColor: '#2D9E5F', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'center', marginTop: 12, shadowColor: '#2D9E5F', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 9 }, elevation: 3 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  secondaryButton: { backgroundColor: '#E8F4FD', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#CDE6F8' },
  secondaryButtonText: { color: '#2167A8', fontSize: 17, fontWeight: '900' },
  aiButton: { backgroundColor: '#102033', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'center', marginTop: 10 },
  aiButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  disabledButton: { opacity: 0.52 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#DCEAF2', marginBottom: 14, shadowColor: '#134162', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  progressTitle: { color: '#102033', fontWeight: '900', fontSize: 16 },
  progressSub: { color: '#6B7A90', fontWeight: '700', fontSize: 13, marginTop: 3 },
  progressPercent: { color: '#2D9E5F', fontWeight: '900', fontSize: 24 },
  progressTrack: { height: 11, backgroundColor: '#E8F4FD', borderRadius: 99, overflow: 'hidden', marginTop: 15 },
  progressFill: { height: '100%', backgroundColor: '#2D9E5F', borderRadius: 99 },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#102033', marginVertical: 13, letterSpacing: -0.3 },
  exerciseCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.05, shadowRadius: 13, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  exerciseDone: { backgroundColor: '#F0FBF6', borderColor: '#B9EBCF' },
  exerciseIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#E8F4FD', alignItems: 'center', justifyContent: 'center' },
  exerciseIconDone: { backgroundColor: '#2D9E5F' },
  exerciseIconText: { fontSize: 18, fontWeight: '900', color: '#2167A8' },
  exerciseIconTextDone: { color: '#FFFFFF' },
  exerciseInfo: { flex: 1 },
  exerciseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  exerciseName: { color: '#102033', fontSize: 17, fontWeight: '900', flex: 1 },
  todayBadge: { backgroundColor: '#E8F4FD', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 },
  todayBadgeText: { color: '#2167A8', fontSize: 11, fontWeight: '900' },
  doneBadge: { backgroundColor: '#DFF7E9', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 },
  doneBadgeText: { color: '#2D9E5F', fontSize: 11, fontWeight: '900' },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  metaChip: { color: '#496175', backgroundColor: '#F3F9FD', overflow: 'hidden', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4, fontSize: 12, fontWeight: '900' },
  aiMini: { color: '#2D9E5F', backgroundColor: '#E8F8EF', overflow: 'hidden', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4, fontSize: 12, fontWeight: '900' },
  chevron: { color: '#92A5B5', fontSize: 34, fontWeight: '300' },
  backButton: { alignSelf: 'flex-start', marginTop: 10, marginBottom: 12 },
  back: { color: '#2167A8', fontWeight: '900', fontSize: 16 },
  videoBox: { height: 178, borderRadius: 26, backgroundColor: '#102033', alignItems: 'center', justifyContent: 'center', marginBottom: 16, padding: 20 },
  playCircle: { width: 66, height: 66, borderRadius: 33, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  videoIcon: { color: '#FFFFFF', fontSize: 30, marginLeft: 4 },
  videoText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  videoSubText: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', textAlign: 'center', marginTop: 7 },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  infoPill: { flex: 1, backgroundColor: '#F5FAFD', borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#DCEAF2' },
  infoLabel: { color: '#6B7A90', fontSize: 12, fontWeight: '800' },
  infoValue: { color: '#102033', fontSize: 14, fontWeight: '900', marginTop: 5, lineHeight: 19 },
  instructionsCard: { backgroundColor: '#F8FCFE', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#DCEAF2', marginBottom: 4 },
  instructionsTitle: { color: '#102033', fontSize: 16, fontWeight: '900', marginBottom: 6 },
  safetyBox: { backgroundColor: '#FFF8E7', borderWidth: 1, borderColor: '#F4D47C', borderRadius: 18, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  safetyIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F4D47C', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  safetyIconText: { color: '#755C13', fontWeight: '900' },
  safetyText: { color: '#755C13', fontWeight: '800', lineHeight: 20, flex: 1 },
  cameraPrepBox: { backgroundColor: '#E8F4FD', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#CDE6F8' },
  phoneMock: { width: 78, height: 112, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: '#2167A8', alignItems: 'center', justifyContent: 'center', shadowColor: '#134162', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  phoneMockText: { fontSize: 35 },
  instruction: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 11 },
  check: { color: '#2D9E5F', fontSize: 16, fontWeight: '900' },
  instructionText: { color: '#496175', fontSize: 15, lineHeight: 21, flex: 1, fontWeight: '700' },
  darkScreen: { backgroundColor: '#07111F', borderRadius: 32, padding: 22, minHeight: 690, alignItems: 'center', justifyContent: 'center' },
  darkSmall: { color: 'rgba(255,255,255,0.64)', fontWeight: '900', marginBottom: 8 },
  darkTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', marginBottom: 22 },
  cameraFrame: { width: '100%', height: 350, borderRadius: 30, borderWidth: 2, borderColor: '#62D6A4', alignItems: 'center', justifyContent: 'center', marginBottom: 28, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' },
  poseHead: { position: 'absolute', top: 74, width: 42, height: 42, borderRadius: 21, borderWidth: 3, borderColor: '#62D6A4' },
  poseBody: { position: 'absolute', top: 122, width: 3, height: 92, backgroundColor: '#62D6A4' },
  poseArmLeft: { position: 'absolute', top: 142, left: 96, width: 90, height: 3, backgroundColor: '#62D6A4', transform: [{ rotate: '-18deg' }] },
  poseArmRight: { position: 'absolute', top: 142, right: 96, width: 90, height: 3, backgroundColor: '#62D6A4', transform: [{ rotate: '18deg' }] },
  poseLegLeft: { position: 'absolute', top: 214, left: 122, width: 78, height: 3, backgroundColor: '#62D6A4', transform: [{ rotate: '-58deg' }] },
  poseLegRight: { position: 'absolute', top: 214, right: 122, width: 78, height: 3, backgroundColor: '#62D6A4', transform: [{ rotate: '58deg' }] },
  cameraGuide: { position: 'absolute', bottom: 22, color: 'rgba(255,255,255,0.7)', fontWeight: '800' },
  countdownHint: { color: 'rgba(255,255,255,0.82)', fontSize: 16, marginBottom: 8, fontWeight: '800' },
  countdown: { color: '#FFFFFF', fontSize: 64, fontWeight: '900' },
  analyzing: { color: '#FFFFFF', marginTop: 14, fontWeight: '900', fontSize: 16 },
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#DCEAF2', marginTop: 14, shadowColor: '#134162', shadowOpacity: 0.1, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  scoreRing: { width: 150, height: 150, borderRadius: 75, borderWidth: 12, borderColor: '#2D9E5F', alignItems: 'center', justifyContent: 'center', marginVertical: 8, backgroundColor: '#F0FBF6' },
  score: { color: '#2D9E5F', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  scoreLabel: { color: '#496175', fontWeight: '900', marginTop: -2 },
  resultBadge: { backgroundColor: '#E8F8EF', borderRadius: 99, paddingHorizontal: 15, paddingVertical: 8, marginBottom: 14 },
  resultBadgeText: { color: '#2D9E5F', fontWeight: '900' },
  feedbackList: { width: '100%', marginBottom: 4 },
  feedbackCard: { width: '100%', backgroundColor: '#F8FCFE', borderWidth: 1, borderColor: '#DCEAF2', borderRadius: 18, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  feedbackIcon: { color: '#2D9E5F', fontWeight: '900' },
  feedbackText: { color: '#496175', flex: 1, fontSize: 15, lineHeight: 21, fontWeight: '800' },
  disclaimerBox: { backgroundColor: '#FFF8E7', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#F4D47C', width: '100%' },
  disclaimerText: { color: '#755C13', fontWeight: '800', lineHeight: 20, textAlign: 'center' },
  painGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  painButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#E8F4FD', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CDE6F8' },
  painButtonSelected: { backgroundColor: '#2167A8', borderColor: '#2167A8' },
  painButtonWarning: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' },
  painText: { color: '#2167A8', fontWeight: '900', fontSize: 18 },
  painTextSelected: { color: '#FFFFFF' },
  warningInline: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: 1, borderRadius: 16, padding: 13, marginTop: 14 },
  warningInlineText: { color: '#9A3412', fontWeight: '900', textAlign: 'center' },
  warningCard: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: 1, borderRadius: 30, padding: 24, alignItems: 'center', marginTop: 14 },
  warningIcon: { fontSize: 48, marginBottom: 8 },
  savedIcon: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#2D9E5F', color: '#FFFFFF', textAlign: 'center', textAlignVertical: 'center', fontSize: 40, fontWeight: '900', overflow: 'hidden', marginBottom: 14 },
  bottomNav: { position: 'absolute', left: 14, right: 14, bottom: 14, height: 74, borderRadius: 26, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCEAF2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', shadowColor: '#134162', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  navItem: { alignItems: 'center', gap: 4, flex: 1 },
  navItemActive: { alignItems: 'center', gap: 4, flex: 1 },
  navIcon: { color: '#2167A8', fontSize: 18, fontWeight: '900' },
  navIconMuted: { color: '#92A5B5', fontSize: 17, fontWeight: '900' },
  navText: { color: '#92A5B5', fontSize: 11, fontWeight: '800' },
  navTextActive: { color: '#2167A8', fontSize: 11, fontWeight: '900' },
});
