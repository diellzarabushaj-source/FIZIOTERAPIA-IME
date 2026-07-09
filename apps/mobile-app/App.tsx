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
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  loginPatientWithCode,
  saveMobileProgress,
  type MobileExercise,
  type MobilePatient,
} from './lib/api';

type Screen = 'login' | 'plan' | 'exercise' | 'ai-prep' | 'ai-checking' | 'ai-result' | 'pain' | 'pain-warning' | 'saved';
type AlertType = 'good' | 'needs_attention' | 'contact_physio';

type ExerciseWithVideo = MobileExercise & { videoUrl?: string; difficulty?: string };

const DEMO_PATIENT: MobilePatient = {
  id: 'demo-patient-1',
  code: 'ARB-4821',
  name: 'Arbër Rexha',
  diagnosis: 'Lumbosciatica',
};

const DEMO_PLAN_TITLE = 'Plani juaj 14 ditë – Lumbosciatica';
const DEMO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const DEMO_EXERCISES: ExerciseWithVideo[] = [
  {
    id: 'ex-1',
    planExerciseId: 'ex-1',
    name: 'Glute bridge',
    meta: '3 sete × 12 përsëritje',
    duration: '5 min',
    aiEnabled: true,
    difficulty: 'E lehtë',
    videoUrl: DEMO_VIDEO_URL,
    instructions: 'Shtrihu në shpinë, përkul gjunjët dhe ngriti ijet ngadalë. Mbaje legenin stabil dhe mos e shpejto lëvizjen.',
  },
  {
    id: 'ex-2',
    planExerciseId: 'ex-2',
    name: 'Cat cow',
    meta: '2 sete × 10 përsëritje',
    duration: '4 min',
    aiEnabled: true,
    difficulty: 'E lehtë',
    videoUrl: DEMO_VIDEO_URL,
    instructions: 'Fillo me katër këmbë. Lëvize shpinën ngadalë nga pozicioni i maces në pozicionin e lopës pa dhimbje të fortë.',
  },
  {
    id: 'ex-3',
    planExerciseId: 'ex-3',
    name: 'Piriformis stretch',
    meta: '3 × 30 sekonda',
    duration: '6 min',
    aiEnabled: false,
    difficulty: 'E mesme',
    videoUrl: DEMO_VIDEO_URL,
    instructions: 'Kryqëzo këmbën mbi gjurin tjetër dhe tërhiq butësisht drejt gjoksit derisa të ndjesh shtrirje të kontrolluar.',
  },
  {
    id: 'ex-4',
    planExerciseId: 'ex-4',
    name: 'Pelvic tilt',
    meta: '2 sete × 12 përsëritje',
    duration: '4 min',
    aiEnabled: true,
    difficulty: 'E lehtë',
    videoUrl: DEMO_VIDEO_URL,
    instructions: 'Shtrihu në shpinë dhe shtype lehtë pjesën e poshtme të shpinës drejt dyshemesë. Lëvizja duhet të jetë e vogël dhe e kontrolluar.',
  },
];

const AI_FEEDBACK = [
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
  const [exercises, setExercises] = useState<ExerciseWithVideo[]>(DEMO_EXERCISES);
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
        }, 2200);
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
      setExercises((session.exercises.length ? session.exercises : DEMO_EXERCISES) as ExerciseWithVideo[]);
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
        setSaveText('Demo mode aktiv. Për live mode lidhet web API + Supabase.');
        setScreen('plan');
      } else {
        setError(loginError instanceof Error ? loginError.message : 'Kodi nuk u gjet. Kontrollo kodin nga fizioterapeuti.');
      }
    } finally {
      setLoadingLogin(false);
    }
  }

  function openExercise(exercise: ExerciseWithVideo) {
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
          feedback: `${AI_FEEDBACK.join(' ')} ${painComment ? `Koment: ${painComment}` : ''}`.trim(),
          alertType,
          painScore: finalPainScore,
        });
        setSaveText(result.notification?.sent ? 'U ruajt në Supabase dhe fizioterapeuti u njoftua.' : 'U ruajt në Supabase.');
      } else {
        setSaveText('U ruajt në demo mode. Për live mode përdoret web API + Supabase.');
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
        <ScrollView contentContainerStyle={[styles.container, screen === 'ai-checking' && styles.noBottomPad]} showsVerticalScrollIndicator={false}>
          {screen === 'login' && (
            <View style={styles.loginScreen}>
              <View style={styles.loginAura} />
              <View style={styles.loginHero}>
                <View style={styles.logoCircle}><Text style={styles.logoText}>FP</Text></View>
                <Text style={styles.brandTitle}>FizioPlan</Text>
                <Text style={styles.brandSubtitle}>Plani juaj i fizioterapisë</Text>
              </View>

              <View style={styles.loginCard}>
                <Text style={styles.eyebrow}>Hyrje për pacientin</Text>
                <Text style={styles.loginTitle}>Hyr me kodin e pacientit</Text>
                <Text style={styles.loginText}>Kodi merret nga fizioterapeuti juaj. Plani dhe ushtrimet janë të personalizuara për ju.</Text>
                <Text style={styles.fieldLabel}>Kodi i pacientit</Text>
                <View style={styles.inputWrap}>
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
                  <View style={styles.modePill}><Text style={styles.modePillText}>{onlineMode ? 'Live' : 'Demo'}</Text></View>
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
                <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
              </View>

              <View style={styles.safetyBox}><Text style={styles.safetyText}>Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.</Text></View>
              <Text style={styles.sectionTitle}>Ushtrimet për sot</Text>

              {exercises.map((exercise, index) => {
                const completed = completedIds.includes(exercise.id);
                return (
                  <TouchableOpacity key={exercise.id} style={[styles.exerciseCard, completed && styles.exerciseDone]} onPress={() => openExercise(exercise)} activeOpacity={0.82}>
                    <View style={[styles.exerciseNumber, completed && styles.exerciseNumberDone]}><Text style={[styles.exerciseNumberText, completed && styles.exerciseNumberTextDone]}>{completed ? '✓' : index + 1}</Text></View>
                    <View style={styles.exerciseInfo}>
                      <View style={styles.exerciseTitleRow}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={completed ? styles.doneBadge : styles.todayBadge}>{completed ? 'Kryer' : 'Sot'}</Text>
                      </View>
                      <Text style={styles.smallText}>{exercise.meta} · {exercise.duration}</Text>
                      <View style={styles.cardMetaRow}>
                        <Text style={styles.metaChip}>{exercise.difficulty || 'E lehtë'}</Text>
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
              <View style={styles.card}>
                <Text style={styles.eyebrow}>Ushtrimi</Text>
                <Text style={styles.title}>{selectedExercise.name}</Text>
                <ExerciseVideo uri={selectedExercise.videoUrl || DEMO_VIDEO_URL} />
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
                  <TouchableOpacity style={styles.darkButton} onPress={() => setScreen('ai-prep')} activeOpacity={0.86}>
                    <Text style={styles.darkButtonText}>Kontrollo lëvizjen me kamerë</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {screen === 'ai-prep' && (
            <View>
              <BackButton label="Kthehu te ushtrimi" onPress={() => setScreen('exercise')} />
              <View style={styles.card}>
                <Text style={styles.eyebrow}>Movement quality check</Text>
                <Text style={styles.title}>Përgatitu për kontrollin me kamerë</Text>
                <View style={styles.prepPanel}>
                  <Text style={styles.prepTitle}>Pozicionimi i telefonit</Text>
                  <Instruction text="Vendose telefonin në një vend stabil." />
                  <Instruction text="Trupi duhet të shihet qartë në ekran." />
                  <Instruction text="Bëje ushtrimin ngadalë dhe me kontroll." />
                </View>
                <View style={styles.safetyBox}>
                  <Text style={styles.safetyText}>Ky kontroll jep vetëm feedback për cilësinë e lëvizjes. Nuk diagnostikon, nuk përshkruan ushtrime dhe nuk e ndryshon planin.</Text>
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('ai-checking')} activeOpacity={0.86}>
                  <Text style={styles.primaryButtonText}>Hap kamerën</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {screen === 'ai-checking' && (
            <CameraCheckView
              exerciseName={selectedExercise?.name || 'Ushtrimi'}
              countdown={countdown}
              isAnalyzing={isAnalyzing}
              onCancel={() => setScreen('ai-prep')}
            />
          )}

          {screen === 'ai-result' && (
            <View style={styles.resultCard}>
              <Text style={styles.eyebrow}>Rezultati i kontrollit</Text>
              <View style={styles.scoreRing}>
                <Text style={styles.score}>{aiScore}%</Text>
                <Text style={styles.scoreLabel}>cilësi lëvizjeje</Text>
              </View>
              <Text style={styles.title}>{getAlertLabel(alertType)}</Text>
              <View style={styles.feedbackList}>{AI_FEEDBACK.map((item) => <FeedbackCard key={item} text={item} />)}</View>
              <View style={styles.disclaimerBox}><Text style={styles.disclaimerText}>Ky feedback nuk e zëvendëson vlerësimin e fizioterapeutit.</Text></View>
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
                  <TouchableOpacity key={index} style={[styles.painButton, painScore === index && styles.painButtonSelected, index >= 7 && painScore !== index && styles.painButtonWarning]} onPress={() => setPainScore(index)} activeOpacity={0.8}>
                    <Text style={[styles.painText, painScore === index && styles.painTextSelected]}>{index}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {painScore !== null && painScore >= 7 && <View style={styles.warningInline}><Text style={styles.warningInlineText}>Ndalo ushtrimin dhe kontakto fizioterapeutin.</Text></View>}
              <TextInput value={painComment} onChangeText={setPainComment} style={styles.commentInput} placeholder="Koment opsional për fizioterapeutin" placeholderTextColor="#8AA0B3" multiline />
              <TouchableOpacity style={[styles.primaryButton, painScore === null && styles.disabledButton]} onPress={confirmPain} activeOpacity={0.86} disabled={painScore === null || saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Duke ruajtur...' : 'Vazhdo'}</Text>
              </TouchableOpacity>
              {saving && <ActivityIndicator color="#2D9E5F" style={{ marginTop: 16 }} />}
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
        {showShell && <BottomNav onPlan={() => setScreen('plan')} />}
      </View>
    </SafeAreaView>
  );
}

function ExerciseVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (playerInstance) => {
    playerInstance.loop = false;
  });

  return (
    <View style={styles.videoSection}>
      <VideoView style={styles.videoPlayer} player={player} allowsFullscreen allowsPictureInPicture nativeControls />
      <Text style={styles.videoNote}>Video demo. Në versionin live, fizioterapeuti vendos video udhëzuese për secilin ushtrim.</Text>
    </View>
  );
}

function CameraCheckView({ exerciseName, countdown, isAnalyzing, onCancel }: { exerciseName: string; countdown: number; isAnalyzing: boolean; onCancel: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View style={styles.cameraFallback}><ActivityIndicator color="#2D9E5F" /><Text style={styles.cameraFallbackText}>Duke hapur kamerën...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.cameraPermissionCard}>
        <Text style={styles.title}>Lejo kamerën</Text>
        <Text style={styles.text}>Kamera përdoret vetëm për kontroll të lëvizjes. Videoja nuk ruhet.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission} activeOpacity={0.86}>
          <Text style={styles.primaryButtonText}>Lejo kamerën</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel} activeOpacity={0.86}>
          <Text style={styles.secondaryButtonText}>Kthehu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <CameraView style={styles.realCamera} facing="front" active={!isAnalyzing}>
        <View style={styles.cameraTopBar}>
          <View>
            <Text style={styles.cameraLabel}>Kontrolli i lëvizjes</Text>
            <Text style={styles.cameraExercise}>{exerciseName}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}><Text style={styles.closeText}>Mbyll</Text></TouchableOpacity>
        </View>
        <View style={styles.poseGuide}>
          <View style={styles.poseHead} />
          <View style={styles.poseBody} />
          <View style={styles.poseShoulders} />
          <View style={styles.poseHips} />
          <View style={styles.poseLegLeft} />
          <View style={styles.poseLegRight} />
        </View>
        <View style={styles.cameraBottomPanel}>
          {!isAnalyzing ? (
            <>
              <Text style={styles.cameraInstruction}>Vendose trupin brenda vijave dhe fillo ngadalë</Text>
              <Text style={styles.countdown}>{countdown}</Text>
            </>
          ) : (
            <>
              <ActivityIndicator color="#62D6A4" size="large" />
              <Text style={styles.analyzing}>Duke analizuar lëvizjen...</Text>
              <Text style={styles.cameraInstruction}>Nuk ruhet videoja. Analizohet vetëm cilësia e lëvizjes.</Text>
            </>
          )}
        </View>
      </CameraView>
    </View>
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

function BottomNav({ onPlan }: { onPlan: () => void }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItemActive} onPress={onPlan} activeOpacity={0.82}><Text style={styles.navIcon}>⌂</Text><Text style={styles.navTextActive}>Plani</Text></TouchableOpacity>
      <View style={styles.navItem}><Text style={styles.navIconMuted}>□</Text><Text style={styles.navText}>Ushtrimet</Text></View>
      <View style={styles.navItem}><Text style={styles.navIconMuted}>—</Text><Text style={styles.navText}>Mesazhet</Text></View>
      <View style={styles.navItem}><Text style={styles.navIconMuted}>○</Text><Text style={styles.navText}>Profili</Text></View>
    </View>
  );
}

function BackButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.backButton}><Text style={styles.back}>‹ {label}</Text></TouchableOpacity>;
}

function Instruction({ text }: { text: string }) {
  return <View style={styles.instruction}><Text style={styles.check}>✓</Text><Text style={styles.instructionText}>{text}</Text></View>;
}

function FeedbackCard({ text }: { text: string }) {
  return <View style={styles.feedbackCard}><Text style={styles.feedbackIcon}>✓</Text><Text style={styles.feedbackText}>{text}</Text></View>;
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoPill}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F9FC' },
  appFrame: { flex: 1, backgroundColor: '#F4F9FC' },
  container: { padding: 18, paddingBottom: 112 },
  noBottomPad: { padding: 0, paddingBottom: 0 },
  loginScreen: { minHeight: 760, paddingTop: 18 },
  loginAura: { position: 'absolute', top: -120, left: -60, right: -60, height: 320, borderBottomLeftRadius: 150, borderBottomRightRadius: 150, backgroundColor: '#DDF0FF' },
  loginHero: { alignItems: 'center', paddingTop: 34, paddingBottom: 22 },
  logoCircle: { width: 82, height: 82, borderRadius: 28, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#134162', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  logoText: { color: '#2167A8', fontWeight: '900', fontSize: 29, letterSpacing: -1 },
  brandTitle: { color: '#102033', fontSize: 38, fontWeight: '900', letterSpacing: -1.2, marginTop: 16 },
  brandSubtitle: { color: '#496175', fontSize: 17, fontWeight: '700', marginTop: 5 },
  loginCard: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 24, borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.12, shadowRadius: 26, shadowOffset: { width: 0, height: 16 }, elevation: 5 },
  loginTitle: { fontSize: 29, lineHeight: 34, fontWeight: '900', color: '#102033', letterSpacing: -0.7, marginBottom: 10 },
  loginText: { fontSize: 16, lineHeight: 24, color: '#496175', marginBottom: 20 },
  trustText: { color: '#2D9E5F', fontSize: 14, fontWeight: '900', textAlign: 'center', marginTop: 15 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 18, marginTop: 8, padding: 12, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCEAF2' },
  headerLogo: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#2167A8', alignItems: 'center', justifyContent: 'center' },
  headerLogoText: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#102033', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, color: '#6B7A90', marginTop: 2, fontWeight: '700' },
  headerStatus: { color: '#2D9E5F', fontSize: 16 },
  dashboardHero: { backgroundColor: '#2167A8', borderRadius: 30, padding: 22, marginTop: 12, marginBottom: 16, shadowColor: '#134162', shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' },
  whiteSmall: { color: 'rgba(255,255,255,0.78)', fontSize: 14, fontWeight: '800' },
  whiteTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 3, letterSpacing: -0.7 },
  modePill: { backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  modePillText: { color: '#2167A8', fontWeight: '900' },
  planGlassCard: { marginTop: 22, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 24, padding: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  planLabel: { color: 'rgba(255,255,255,0.76)', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  planTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 27, fontWeight: '900', marginTop: 7 },
  planMeta: { color: 'rgba(255,255,255,0.82)', fontWeight: '700', marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#DCEAF2', shadowColor: '#134162', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  cardCentered: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#DCEAF2' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '900', color: '#102033', letterSpacing: -0.6, marginBottom: 12 },
  text: { fontSize: 16, lineHeight: 24, color: '#496175', marginBottom: 16 },
  textCenterMuted: { color: '#496175', fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 16 },
  helper: { fontSize: 13, color: '#6B7A90', marginTop: 10, textAlign: 'center' },
  smallText: { fontSize: 13, lineHeight: 18, color: '#6B7A90', fontWeight: '700' },
  eyebrow: { color: '#2167A8', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  fieldLabel: { color: '#102033', fontWeight: '900', marginBottom: 8, fontSize: 14 },
  inputWrap: { borderWidth: 2, borderColor: '#D1E5F8', borderRadius: 18, paddingHorizontal: 14, backgroundColor: '#FBFDFF', marginBottom: 12 },
  input: { paddingVertical: 17, fontSize: 18, color: '#102033', fontWeight: '900', letterSpacing: 1.2 },
  error: { color: '#B42318', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 14, padding: 12, marginBottom: 12, fontWeight: '800' },
  primaryButton: { backgroundColor: '#2D9E5F', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'center', marginTop: 12, shadowColor: '#2D9E5F', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  secondaryButton: { backgroundColor: '#E8F4FD', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#CDE6F8' },
  secondaryButtonText: { color: '#2167A8', fontSize: 17, fontWeight: '900' },
  darkButton: { backgroundColor: '#102033', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'center', marginTop: 10 },
  darkButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  disabledButton: { opacity: 0.52 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#DCEAF2', marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  progressTitle: { color: '#102033', fontWeight: '900', fontSize: 16 },
  progressSub: { color: '#6B7A90', fontWeight: '700', fontSize: 13, marginTop: 3 },
  progressPercent: { color: '#2D9E5F', fontWeight: '900', fontSize: 24 },
  progressTrack: { height: 11, backgroundColor: '#E8F4FD', borderRadius: 99, overflow: 'hidden', marginTop: 15 },
  progressFill: { height: '100%', backgroundColor: '#2D9E5F', borderRadius: 99 },
  sectionTitle: { fontSize: 21, fontWeight: '900', color: '#102033', marginVertical: 13, letterSpacing: -0.3 },
  exerciseCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, borderWidth: 1, borderColor: '#DCEAF2' },
  exerciseDone: { backgroundColor: '#F0FBF6', borderColor: '#B9EBCF' },
  exerciseNumber: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#E8F4FD', alignItems: 'center', justifyContent: 'center' },
  exerciseNumberDone: { backgroundColor: '#2D9E5F' },
  exerciseNumberText: { fontSize: 17, fontWeight: '900', color: '#2167A8' },
  exerciseNumberTextDone: { color: '#FFFFFF' },
  exerciseInfo: { flex: 1 },
  exerciseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  exerciseName: { color: '#102033', fontSize: 17, fontWeight: '900', flex: 1 },
  todayBadge: { color: '#2167A8', backgroundColor: '#E8F4FD', overflow: 'hidden', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '900' },
  doneBadge: { color: '#2D9E5F', backgroundColor: '#DFF7E9', overflow: 'hidden', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '900' },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  metaChip: { color: '#496175', backgroundColor: '#F3F9FD', overflow: 'hidden', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4, fontSize: 12, fontWeight: '900' },
  aiMini: { color: '#2D9E5F', backgroundColor: '#E8F8EF', overflow: 'hidden', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 4, fontSize: 12, fontWeight: '900' },
  chevron: { color: '#92A5B5', fontSize: 32, fontWeight: '300' },
  backButton: { alignSelf: 'flex-start', marginTop: 10, marginBottom: 12 },
  back: { color: '#2167A8', fontWeight: '900', fontSize: 16 },
  videoSection: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#102033', marginBottom: 16 },
  videoPlayer: { width: '100%', height: 210, backgroundColor: '#102033' },
  videoNote: { color: 'rgba(255,255,255,0.76)', fontWeight: '700', fontSize: 12, lineHeight: 17, paddingHorizontal: 14, paddingVertical: 12 },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  infoPill: { flex: 1, backgroundColor: '#F5FAFD', borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#DCEAF2' },
  infoLabel: { color: '#6B7A90', fontSize: 12, fontWeight: '800' },
  infoValue: { color: '#102033', fontSize: 14, fontWeight: '900', marginTop: 5, lineHeight: 19 },
  instructionsCard: { backgroundColor: '#F8FCFE', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#DCEAF2', marginBottom: 4 },
  instructionsTitle: { color: '#102033', fontSize: 16, fontWeight: '900', marginBottom: 6 },
  prepPanel: { backgroundColor: '#F8FCFE', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#DCEAF2', marginBottom: 14 },
  prepTitle: { color: '#102033', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  safetyBox: { backgroundColor: '#FFF8E7', borderWidth: 1, borderColor: '#F4D47C', borderRadius: 18, padding: 14, marginBottom: 14 },
  safetyText: { color: '#755C13', fontWeight: '800', lineHeight: 20 },
  instruction: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  check: { color: '#2D9E5F', fontSize: 16, fontWeight: '900' },
  instructionText: { color: '#496175', fontSize: 15, lineHeight: 21, flex: 1, fontWeight: '700' },
  cameraScreen: { flex: 1, minHeight: 760, backgroundColor: '#07111F' },
  realCamera: { minHeight: 760, justifyContent: 'space-between', backgroundColor: '#07111F' },
  cameraTopBar: { margin: 18, marginTop: 28, padding: 14, borderRadius: 22, backgroundColor: 'rgba(7,17,31,0.72)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cameraLabel: { color: 'rgba(255,255,255,0.72)', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  cameraExercise: { color: '#FFFFFF', fontWeight: '900', fontSize: 20, marginTop: 3 },
  closeButton: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  closeText: { color: '#FFFFFF', fontWeight: '900' },
  poseGuide: { alignSelf: 'center', width: 210, height: 330, borderRadius: 105, borderWidth: 2, borderColor: 'rgba(98,214,164,0.72)', alignItems: 'center' },
  poseHead: { position: 'absolute', top: 42, width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: '#62D6A4' },
  poseBody: { position: 'absolute', top: 91, width: 3, height: 116, backgroundColor: '#62D6A4' },
  poseShoulders: { position: 'absolute', top: 118, width: 122, height: 3, backgroundColor: '#62D6A4' },
  poseHips: { position: 'absolute', top: 205, width: 86, height: 3, backgroundColor: '#62D6A4' },
  poseLegLeft: { position: 'absolute', top: 210, left: 73, width: 74, height: 3, backgroundColor: '#62D6A4', transform: [{ rotate: '64deg' }] },
  poseLegRight: { position: 'absolute', top: 210, right: 73, width: 74, height: 3, backgroundColor: '#62D6A4', transform: [{ rotate: '-64deg' }] },
  cameraBottomPanel: { margin: 18, marginBottom: 32, padding: 18, borderRadius: 24, backgroundColor: 'rgba(7,17,31,0.78)', alignItems: 'center' },
  cameraInstruction: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 21, fontWeight: '800', textAlign: 'center' },
  countdown: { color: '#FFFFFF', fontSize: 62, fontWeight: '900', marginTop: 8 },
  analyzing: { color: '#FFFFFF', marginTop: 14, fontWeight: '900', fontSize: 16 },
  cameraFallback: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, alignItems: 'center' },
  cameraFallbackText: { color: '#496175', fontWeight: '800', marginTop: 12 },
  cameraPermissionCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#DCEAF2' },
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#DCEAF2', marginTop: 14 },
  scoreRing: { width: 150, height: 150, borderRadius: 75, borderWidth: 12, borderColor: '#2D9E5F', alignItems: 'center', justifyContent: 'center', marginVertical: 8, backgroundColor: '#F0FBF6' },
  score: { color: '#2D9E5F', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  scoreLabel: { color: '#496175', fontWeight: '900', marginTop: -2, fontSize: 12 },
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
  commentInput: { minHeight: 86, borderWidth: 1.5, borderColor: '#DCEAF2', borderRadius: 20, padding: 15, color: '#102033', fontSize: 15, backgroundColor: '#FBFDFF', textAlignVertical: 'top', marginTop: 16 },
  warningInline: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: 1, borderRadius: 16, padding: 13, marginTop: 14 },
  warningInlineText: { color: '#9A3412', fontWeight: '900', textAlign: 'center' },
  warningCard: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: 1, borderRadius: 28, padding: 24, alignItems: 'center', marginTop: 14 },
  warningIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FDBA74', color: '#9A3412', textAlign: 'center', textAlignVertical: 'center', fontSize: 36, fontWeight: '900', overflow: 'hidden', marginBottom: 8 },
  savedIcon: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#2D9E5F', color: '#FFFFFF', textAlign: 'center', textAlignVertical: 'center', fontSize: 40, fontWeight: '900', overflow: 'hidden', marginBottom: 14 },
  bottomNav: { position: 'absolute', left: 14, right: 14, bottom: 14, height: 74, borderRadius: 26, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCEAF2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', shadowColor: '#134162', shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  navItem: { alignItems: 'center', gap: 4, flex: 1 },
  navItemActive: { alignItems: 'center', gap: 4, flex: 1 },
  navIcon: { color: '#2167A8', fontSize: 18, fontWeight: '900' },
  navIconMuted: { color: '#92A5B5', fontSize: 17, fontWeight: '900' },
  navText: { color: '#92A5B5', fontSize: 11, fontWeight: '800' },
  navTextActive: { color: '#2167A8', fontSize: 11, fontWeight: '900' },
});
