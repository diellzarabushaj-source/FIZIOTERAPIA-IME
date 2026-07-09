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
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'light';

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
  name: 'Arber Rexha',
  diagnosis: 'Lumbosciatica',
  planTitle: 'Program 14 ditor per lumbosciatica',
  physio: 'Dr. Diellza Rabushaj',
};

const exercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Glute bridge',
    meta: '3 sete x 12 perseritje',
    duration: '5 min',
    aiEnabled: true,
    instructions: 'Shtrihu ne shpine, perkul gjunjet dhe ngriti ijet ngadale. Mbaje legenin stabil dhe mos e shpejto levizjen.',
  },
  {
    id: 'ex-2',
    name: 'Cat cow',
    meta: '2 sete x 10 perseritje',
    duration: '4 min',
    aiEnabled: true,
    instructions: 'Fillo me kater kembe. Levize shpinen ngadale dhe pa dhimbje te forte.',
  },
  {
    id: 'ex-3',
    name: 'Piriformis stretch',
    meta: '3 x 30 sekonda',
    duration: '6 min',
    aiEnabled: false,
    instructions: 'Kryqezo kemben mbi gjurin tjeter dhe terhiq butesisht drejt gjoksit derisa te ndjesh shtrirje te kontrolluar.',
  },
  {
    id: 'ex-4',
    name: 'Bird dog',
    meta: '2 sete x 8 secila ane',
    duration: '7 min',
    aiEnabled: true,
    instructions: 'Nga pozicioni me kater kembe, zgjat doren dhe kemben e kundert. Mbaje trupin stabil dhe mos e lako shpinen.',
  },
];

const aiFeedback = [
  'Mbaje legenin me stabil gjate ngritjes.',
  'Ritmi eshte i mire, por kthimi duhet te jete me i ngadalte.',
  'Nese dhimbja rritet, ndalo dhe kontakto fizioterapeutin.',
];

const toneMap: Record<Tone, { bg: string; border: string; text: string }> = {
  success: { bg: '#E9F8EF', border: '#CBEDD9', text: '#13744D' },
  warning: { bg: '#FFF4DF', border: '#FFE1A8', text: '#A15C00' },
  danger: { bg: '#FFF0EE', border: '#FFD0CA', text: '#B42318' },
  info: { bg: '#EAF3FF', border: '#D7E8FF', text: '#2563EB' },
  light: { bg: 'rgba(255,255,255,0.16)', border: 'rgba(255,255,255,0.28)', text: '#FFFFFF' },
};

function getAlertType(score: number): AlertType {
  if (score > 80) return 'good';
  if (score >= 60) return 'needs_attention';
  return 'contact_physio';
}

function getPainTone(score: number): Tone {
  if (score >= 7) return 'danger';
  if (score >= 4) return 'warning';
  return 'success';
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
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        return;
      }
      clearInterval(interval);
      setIsAnalyzing(true);
      timeout = setTimeout(() => {
        setIsAnalyzing(false);
        setScreen('ai-result');
      }, 1500);
    }, 800);

    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [screen]);

  function handleLogin() {
    if (code.trim().toUpperCase() !== PATIENT.code) {
      setError('Kodi nuk u gjet. Per demo perdor ARB-4821.');
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
    setSaveText(result.demoMode ? 'U ruajt ne demo mode. Supabase aktivizohet kur shtohen env keys.' : 'U ruajt ne Supabase.');
    setScreen('saved');
  }

  function selectPain(score: number) {
    setPainScore(score);
    if (score >= 7) {
      setScreen('pain-warning');
      return;
    }
    void saveResult(score);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={screen === 'ai-checking' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {screen !== 'ai-checking' && <Header onHome={() => setScreen(screen === 'login' ? 'login' : 'plan')} />}

        {screen === 'login' && (
          <View style={styles.stack}>
            <View style={styles.hero}>
              <View style={styles.rowBetween}>
                <BrandBadge />
                <Pill label="Code-only access" tone="info" />
              </View>
              <Text style={styles.heroTitle}>Plani i fizioterapise ne telefon.</Text>
              <Text style={styles.heroText}>Hyr me kodin qe ta jep fizioterapeuti, ndiq ushtrimet dhe raporto dhimbjen pa krijuar llogari.</Text>
              <View style={styles.twoCols}>
                <Metric label="Plani" value="Dita 3/14" />
                <Metric label="Siguria" value="7/10 stop" />
              </View>
            </View>

            <Card raised>
              <View style={styles.rowBetweenTop}>
                <View>
                  <Text style={styles.eyebrow}>Patient portal</Text>
                  <Text style={styles.title}>Hyr me kod</Text>
                </View>
                <Pill label="Pa account" tone="success" />
              </View>
              <Text style={styles.text}>Kodi unik e lidh pacientin vetem me planin qe e ka krijuar fizioterapeuti.</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>CODE</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  style={styles.input}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="ARB-4821"
                  placeholderTextColor="#8AA0B3"
                />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button label="Hyr ne plan" onPress={handleLogin} />
              <Text style={styles.helper}>Demo code: ARB-4821</Text>
            </Card>
            <SafetyStrip />
          </View>
        )}

        {screen === 'plan' && (
          <View style={styles.stack}>
            <View style={styles.darkCard}>
              <View style={styles.rowBetweenTop}>
                <View>
                  <Text style={styles.whiteSmall}>Mire se vini,</Text>
                  <Text style={styles.whiteTitle}>{PATIENT.name}</Text>
                </View>
                <Pill label="Dita 3" tone="light" />
              </View>
              <Text style={styles.whiteText}>{PATIENT.planTitle}</Text>
              <View style={styles.chipRow}>
                <Text style={styles.whiteChip}>{PATIENT.diagnosis}</Text>
                <Text style={styles.whiteChip}>{PATIENT.physio}</Text>
              </View>
            </View>

            <Card>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.cardTitle}>Progresi sot</Text>
                  <Text style={styles.smallText}>{completedIds.length}/{exercises.length} ushtrime te kryera</Text>
                </View>
                <Text style={styles.percent}>{progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </Card>

            <View style={styles.twoCols}>
              <StatusCard label="AI checks" value="4 aktiv" tone="info" />
              <StatusCard label="Pain rule" value="7/10 stop" tone="warning" />
            </View>

            <Text style={styles.sectionTitle}>Ushtrimet per sot</Text>
            {exercises.map((exercise, index) => {
              const completed = completedIds.includes(exercise.id);
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[styles.listItem, completed && styles.listItemDone]}
                  onPress={() => openExercise(exercise)}
                  activeOpacity={0.84}
                >
                  <View style={[styles.numberBox, completed && styles.numberBoxDone]}>
                    <Text style={[styles.numberText, completed && styles.numberTextDone]}>{completed ? 'OK' : String(index + 1).padStart(2, '0')}</Text>
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.titleLine}>
                      <Text style={styles.itemTitle}>{exercise.name}</Text>
                      {exercise.aiEnabled ? <Pill label="AI" tone="info" compact /> : null}
                    </View>
                    <Text style={styles.smallText}>{exercise.meta} - {exercise.duration}</Text>
                  </View>
                  <Text style={styles.arrow}>{'>'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {screen === 'exercise' && (
          <View style={styles.stack}>
            <BackButton label="Kthehu te plani" onPress={() => setScreen('plan')} />
            <Card>
              <View style={styles.rowBetweenTop}>
                <View style={styles.flex}>
                  <Text style={styles.eyebrow}>Ushtrimi</Text>
                  <Text style={styles.title}>{selectedExercise.name}</Text>
                </View>
                <Pill label={selectedExercise.aiEnabled ? 'AI aktiv' : 'Manual'} tone={selectedExercise.aiEnabled ? 'info' : 'warning'} />
              </View>
              <VisualGuide label="Udhezim vizual" />
              <View style={styles.stackSmall}>
                <Info label="Doza" value={selectedExercise.meta} />
                <Info label="Koha" value={selectedExercise.duration} />
              </View>
              <Text style={styles.text}>{selectedExercise.instructions}</Text>
              <SafetyStrip compact />
              {selectedExercise.aiEnabled ? <Button label="Kontrollo levizjen me kamere" onPress={() => setScreen('ai-prep')} /> : null}
              <Button label="E perfundova ushtrimin" onPress={() => setScreen('pain')} secondary />
            </Card>
          </View>
        )}

        {screen === 'ai-prep' && (
          <View style={styles.stack}>
            <BackButton label="Kthehu te ushtrimi" onPress={() => setScreen('exercise')} />
            <Card>
              <Text style={styles.eyebrow}>AI Movement Check</Text>
              <Text style={styles.title}>Pergatitu per kontrollin me kamere</Text>
              <VisualGuide label="Telefoni duhet te shohe trupin qarte" phone />
              <Instruction text="Vendose telefonin ne nje vend stabil." />
              <Instruction text="Trupi duhet te shihet qarte ne ekran." />
              <Instruction text="Beje ushtrimin ngadale dhe me kontroll." />
              <SafetyStrip compact />
              <Button label="Fillo kontrollin" onPress={() => setScreen('ai-checking')} />
            </Card>
          </View>
        )}

        {screen === 'ai-checking' && (
          <View style={styles.aiScreen}>
            <Text style={styles.aiTitle}>{selectedExercise.name}</Text>
            <View style={styles.cameraFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
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
                <Text style={styles.aiHint}>Fillo ushtrimin</Text>
                <Text style={styles.countdown}>{countdown}</Text>
              </>
            ) : (
              <>
                <ActivityIndicator color="#62D6A4" size="large" />
                <Text style={styles.aiHint}>Duke analizuar levizjen...</Text>
              </>
            )}
          </View>
        )}

        {screen === 'ai-result' && (
          <Card>
            <Text style={styles.eyebrow}>Rezultati i AI</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.score}>{aiScore}%</Text>
              <Pill label={alertType} tone="success" />
            </View>
            <Text style={styles.title}>Levizje e kontrolluar</Text>
            {aiFeedback.map((item) => <Instruction key={item} text={item} />)}
            <SafetyStrip compact />
            <Button label="Raporto dhimbjen" onPress={() => setScreen('pain')} />
          </Card>
        )}

        {screen === 'pain' && (
          <Card>
            <Text style={styles.eyebrow}>Siguria</Text>
            <Text style={styles.title}>Sa dhimbje pate gjate ushtrimit?</Text>
            <Text style={styles.text}>Zgjedh 0-10. Nese dhimbja eshte 7 ose me shume, ndalo ushtrimin dhe kontakto fizioterapeutin.</Text>
            <View style={styles.painGrid}>
              {Array.from({ length: 11 }, (_, index) => {
                const tone = toneMap[getPainTone(index)];
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.painButton, { backgroundColor: tone.bg, borderColor: tone.border }]}
                    onPress={() => selectPain(index)}
                    activeOpacity={0.84}
                  >
                    <Text style={[styles.painText, { color: tone.text }]}>{index}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {saving ? <ActivityIndicator color="#1F9F96" style={styles.loading} /> : null}
          </Card>
        )}

        {screen === 'pain-warning' && (
          <Card danger>
            <View style={styles.warningMark}><Text style={styles.warningText}>!</Text></View>
            <Text style={styles.title}>Ndalo ushtrimin</Text>
            <Text style={styles.text}>Dhimbja eshte {painScore}/10. Kontakto fizioterapeutin para se te vazhdosh programin.</Text>
            <Button label={saving ? 'Duke ruajtur...' : 'Ruaj dhe njofto fizioterapeutin'} onPress={() => void saveResult()} />
          </Card>
        )}

        {screen === 'saved' && (
          <Card>
            <View style={styles.savedMark}><Text style={styles.savedText}>OK</Text></View>
            <Text style={styles.title}>Seanca u ruajt</Text>
            <Text style={styles.text}>{saveText || 'Rezultati u ruajt.'}</Text>
            <Info label="Ushtrimi" value={selectedExercise.name} />
            <Info label="AI score" value={`${aiScore}%`} />
            <Info label="Dhimbja" value={painScore == null ? 'Pa raport' : `${painScore}/10`} />
            <Button label="Kthehu te plani" onPress={() => setScreen('plan')} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onHome }: { onHome: () => void }) {
  return (
    <TouchableOpacity style={styles.header} onPress={onHome} activeOpacity={0.84}>
      <BrandBadge small />
      <View style={styles.flex}>
        <Text style={styles.headerTitle}>Fizioterapia ime</Text>
        <Text style={styles.headerSub}>Leviz me mire, jeto me mire</Text>
      </View>
      <Pill label="MVP" tone="success" compact />
    </TouchableOpacity>
  );
}

function BrandBadge({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.brand, small && styles.brandSmall]}>
      <Text style={[styles.brandText, small && styles.brandTextSmall]}>FI</Text>
    </View>
  );
}

function Card({ children, raised = false, danger = false }: { children: React.ReactNode; raised?: boolean; danger?: boolean }) {
  return <View style={[styles.card, raised && styles.raised, danger && styles.dangerCard]}>{children}</View>;
}

function Pill({ label, tone, compact = false }: { label: string; tone: Tone; compact?: boolean }) {
  const colors = toneMap[tone];
  return (
    <View style={[styles.pill, compact && styles.pillSmall, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.pillText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function Button({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <TouchableOpacity style={[styles.button, secondary && styles.secondaryButton]} onPress={onPress} activeOpacity={0.86}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function BackButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84}>
      <Text style={styles.back}>{'<'} {label}</Text>
    </TouchableOpacity>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function StatusCard({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const colors = toneMap[tone];
  return (
    <View style={[styles.statusCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Instruction({ text }: { text: string }) {
  return (
    <View style={styles.instruction}>
      <View style={styles.okDot}><Text style={styles.okText}>OK</Text></View>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

function SafetyStrip({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.safety, compact && styles.safetyCompact]}>
      <Text style={styles.safetyLabel}>Safety rule</Text>
      <Text style={styles.safetyText}>Dhimbje 7/10 ose me shume = ndalo ushtrimin dhe kontakto fizioterapeutin.</Text>
    </View>
  );
}

function VisualGuide({ label, phone = false }: { label: string; phone?: boolean }) {
  return (
    <View style={styles.visual}>
      {phone ? (
        <View style={styles.phone}>
          <View style={styles.phoneCam} />
          <View style={styles.phoneTarget} />
        </View>
      ) : (
        <View style={styles.bodyGuideLight}>
          <View style={styles.headLight} />
          <View style={styles.bodyLight} />
          <View style={styles.armLight} />
          <View style={styles.legLight} />
        </View>
      )}
      <Text style={styles.visualLabel}>{label}</Text>
    </View>
  );
}

const baseCard = {
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#DFE9EF',
  backgroundColor: '#FFFFFF',
} as const;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6FAFC' },
  container: { padding: 18, paddingBottom: 42 },
  flex: { flex: 1 },
  stack: { gap: 14 },
  stackSmall: { gap: 10, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowBetweenTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  twoCols: { flexDirection: 'row', gap: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 4 },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#101820', letterSpacing: 0 },
  headerSub: { fontSize: 12, color: '#657586', marginTop: 2 },
  brand: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#101820', alignItems: 'center', justifyContent: 'center' },
  brandSmall: { width: 44, height: 44 },
  brandText: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', letterSpacing: 0 },
  brandTextSmall: { fontSize: 15 },

  hero: { ...baseCard, minHeight: 312, padding: 22, backgroundColor: '#EAF7F5', borderColor: '#CFEEE7', justifyContent: 'space-between' },
  heroTitle: { color: '#101820', fontSize: 36, lineHeight: 39, fontWeight: '900', letterSpacing: 0, marginTop: 18 },
  heroText: { color: '#3B5668', fontSize: 16, lineHeight: 23, marginTop: 10 },
  card: { ...baseCard, padding: 18, shadowColor: '#0F2033', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  raised: { shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 5 },
  dangerCard: { backgroundColor: '#FFF0EE', borderColor: '#FFD0CA' },
  darkCard: { ...baseCard, padding: 20, gap: 14, backgroundColor: '#101820', borderColor: '#101820' },

  title: { fontSize: 26, lineHeight: 32, fontWeight: '900', color: '#101820', letterSpacing: 0, marginBottom: 10 },
  text: { fontSize: 15, lineHeight: 22, color: '#4E6678', marginBottom: 14 },
  smallText: { fontSize: 13, lineHeight: 18, color: '#657586' },
  helper: { fontSize: 13, color: '#657586', marginTop: 10, textAlign: 'center' },
  eyebrow: { color: '#1F9F96', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0, marginBottom: 6 },
  sectionTitle: { fontSize: 20, color: '#101820', fontWeight: '900', marginTop: 4 },
  cardTitle: { fontSize: 16, color: '#101820', fontWeight: '900' },
  percent: { fontSize: 24, color: '#1F9F96', fontWeight: '900' },

  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#D7E6EE', borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#FBFDFF', marginBottom: 12 },
  inputPrefix: { color: '#1F9F96', fontSize: 12, fontWeight: '900', paddingRight: 10, borderRightWidth: 1, borderRightColor: '#D7E6EE' },
  input: { flex: 1, paddingVertical: 16, fontSize: 18, color: '#101820', fontWeight: '900', letterSpacing: 1 },
  error: { color: '#B42318', backgroundColor: '#FFF0EE', borderWidth: 1, borderColor: '#FFD0CA', borderRadius: 8, padding: 12, marginBottom: 12 },

  button: { backgroundColor: '#101820', borderRadius: 8, paddingVertical: 16, paddingHorizontal: 18, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondaryButton: { backgroundColor: '#EEF8F5', borderWidth: 1, borderColor: '#D8EFEA' },
  secondaryButtonText: { color: '#1F7F79' },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1 },
  pillSmall: { paddingHorizontal: 8, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: '900' },

  metric: { flex: 1, borderRadius: 8, padding: 13, backgroundColor: 'rgba(255,255,255,0.58)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  statusCard: { flex: 1, borderRadius: 8, padding: 14, borderWidth: 1 },
  metricLabel: { color: '#657586', fontSize: 12, fontWeight: '800' },
  metricValue: { color: '#101820', fontSize: 18, fontWeight: '900', marginTop: 6 },

  whiteSmall: { color: 'rgba(255,255,255,0.72)', fontSize: 14 },
  whiteTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', marginTop: 2, letterSpacing: 0 },
  whiteText: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 21 },
  whiteChip: { color: '#D8EFEA', fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressTrack: { height: 10, backgroundColor: '#E8EEF3', borderRadius: 999, overflow: 'hidden', marginTop: 14 },
  progressFill: { height: '100%', backgroundColor: '#1F9F96', borderRadius: 999 },

  listItem: { ...baseCard, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  listItemDone: { backgroundColor: '#F2FBF7', borderColor: '#CBEDD9' },
  numberBox: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#EEF3F7', alignItems: 'center', justifyContent: 'center' },
  numberBoxDone: { backgroundColor: '#E9F8EF' },
  numberText: { color: '#657586', fontSize: 13, fontWeight: '900' },
  numberTextDone: { color: '#13744D' },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  itemTitle: { flex: 1, fontSize: 17, color: '#101820', fontWeight: '900' },
  arrow: { fontSize: 22, color: '#9AAABD', fontWeight: '900' },
  back: { color: '#1F7F79', fontWeight: '900', marginBottom: 2, fontSize: 16 },

  info: { ...baseCard, padding: 13, backgroundColor: '#FBFDFF' },
  infoLabel: { color: '#657586', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0 },
  infoValue: { color: '#101820', fontSize: 15, fontWeight: '900', marginTop: 3 },
  instruction: { ...baseCard, flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, backgroundColor: '#FBFDFF', marginBottom: 9 },
  okDot: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#E9F8EF', alignItems: 'center', justifyContent: 'center' },
  okText: { color: '#13744D', fontSize: 9, fontWeight: '900' },
  instructionText: { flex: 1, color: '#101820', fontSize: 15, lineHeight: 21 },
  safety: { backgroundColor: '#FFF4DF', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#FFE1A8' },
  safetyCompact: { marginTop: 2, marginBottom: 4 },
  safetyLabel: { color: '#A15C00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0, marginBottom: 5 },
  safetyText: { color: '#7B4B00', fontSize: 13, lineHeight: 19 },

  visual: { height: 190, borderRadius: 8, backgroundColor: '#F2FBF7', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#D8EFEA', overflow: 'hidden' },
  visualLabel: { color: '#1F7F79', fontWeight: '900', marginTop: 12, textAlign: 'center' },
  bodyGuideLight: { alignItems: 'center', justifyContent: 'center' },
  headLight: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: '#1F9F96', marginBottom: 8 },
  bodyLight: { width: 4, height: 70, borderRadius: 999, backgroundColor: '#1F9F96' },
  armLight: { position: 'absolute', width: 108, height: 4, borderRadius: 999, backgroundColor: '#8FD9CA', top: 54, transform: [{ rotate: '-8deg' }] },
  legLight: { position: 'absolute', width: 108, height: 4, borderRadius: 999, backgroundColor: '#8FD9CA', bottom: -4, transform: [{ rotate: '22deg' }] },
  phone: { width: 86, height: 132, borderRadius: 8, borderWidth: 5, borderColor: '#101820', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  phoneCam: { position: 'absolute', top: 8, width: 28, height: 4, borderRadius: 999, backgroundColor: '#101820' },
  phoneTarget: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, borderColor: '#1F9F96' },

  aiScreen: { backgroundColor: '#080F1A', borderRadius: 8, padding: 18, minHeight: 640, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { color: 'rgba(255,255,255,0.72)', fontSize: 15, marginBottom: 20, fontWeight: '800' },
  cameraFrame: { width: '100%', height: 310, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(98,214,164,0.6)', backgroundColor: '#0D1E32', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 28 },
  cornerTL: { position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#62D6A4' },
  cornerTR: { position: 'absolute', top: 16, right: 16, width: 38, height: 38, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#62D6A4' },
  cornerBL: { position: 'absolute', bottom: 16, left: 16, width: 38, height: 38, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#62D6A4' },
  cornerBR: { position: 'absolute', bottom: 16, right: 16, width: 38, height: 38, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#62D6A4' },
  bodyGuide: { alignItems: 'center', justifyContent: 'center' },
  head: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, borderColor: 'rgba(255,255,255,0.78)', marginBottom: 8 },
  bodyLine: { width: 4, height: 82, backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: 999 },
  armLine: { position: 'absolute', width: 118, height: 4, backgroundColor: 'rgba(255,255,255,0.58)', borderRadius: 999, top: 58, transform: [{ rotate: '-8deg' }] },
  legLine: { position: 'absolute', width: 118, height: 4, backgroundColor: 'rgba(255,255,255,0.58)', borderRadius: 999, bottom: -4, transform: [{ rotate: '22deg' }] },
  scanLine: { position: 'absolute', left: 0, right: 0, top: '48%', height: 3, backgroundColor: '#62D6A4', opacity: 0.86 },
  aiHint: { color: 'rgba(255,255,255,0.72)', fontSize: 16, marginTop: 14 },
  countdown: { color: '#FFFFFF', fontSize: 82, fontWeight: '900', letterSpacing: 0 },

  score: { fontSize: 70, fontWeight: '900', color: '#1F9F96', letterSpacing: 0 },
  painGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  painButton: { width: 54, height: 54, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  painText: { fontSize: 20, fontWeight: '900' },
  warningMark: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#B42318', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  warningText: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  savedMark: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#E9F8EF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  savedText: { color: '#13744D', fontSize: 18, fontWeight: '900' },
  loading: { marginTop: 16 },
});
