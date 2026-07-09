import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  BrandMark,
  Button,
  CameraFrame,
  Card,
  ChecklistItem,
  ExerciseCard,
  InfoRow,
  Metric,
  PainScale,
  Pill,
  ProgressRing,
  SafetyAlert,
  StatusPanel,
  TopBar,
  VisualPanel,
} from './components/ui';
import {
  aiCheck,
  demoDays,
  demoExercises,
  demoPatient,
  getPainTone,
  resolveAiAlert,
  type Exercise,
  type Screen,
} from './data/demo';
import { colors, spacing } from './theme';
import { saveAiCheck } from './lib/supabase';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [code, setCode] = useState(demoPatient.code);
  const [loginError, setLoginError] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState(demoExercises[0].id);
  const [completedIds, setCompletedIds] = useState<string[]>(['ex-2']);
  const [countdown, setCountdown] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [painScore, setPainScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveText, setSaveText] = useState('');
  const [saveWasWarning, setSaveWasWarning] = useState(false);

  const selectedExercise = useMemo(
    () => demoExercises.find((exercise) => exercise.id === selectedExerciseId) ?? demoExercises[0],
    [selectedExerciseId],
  );

  const progress = Math.round((completedIds.length / demoExercises.length) * 100);
  const alertType = resolveAiAlert(aiCheck.score, painScore ?? undefined);

  useEffect(() => {
    if (screen !== 'ai-checking') return;

    setCountdown(3);
    setIsAnalyzing(false);
    let nextCount = 3;
    let analyzeTimer: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      nextCount -= 1;
      if (nextCount > 0) {
        setCountdown(nextCount);
        return;
      }

      clearInterval(interval);
      setIsAnalyzing(true);
      analyzeTimer = setTimeout(() => {
        setIsAnalyzing(false);
        setScreen('ai-result');
      }, 1400);
    }, 780);

    return () => {
      clearInterval(interval);
      if (analyzeTimer) clearTimeout(analyzeTimer);
    };
  }, [screen]);

  function goHome() {
    setScreen(screen === 'login' ? 'login' : 'plan');
  }

  function handleLogin() {
    if (code.trim().toUpperCase() !== demoPatient.code) {
      setLoginError('Kodi nuk u gjet. Per demo perdor ARB-4821.');
      return;
    }
    setLoginError('');
    setScreen('plan');
  }

  function openExercise(exercise: Exercise) {
    setSelectedExerciseId(exercise.id);
    setPainScore(null);
    setSaveText('');
    setSaveWasWarning(false);
    setScreen('exercise');
  }

  async function saveResult(score?: number) {
    const finalPainScore = score ?? painScore ?? undefined;
    const isHighPain = finalPainScore !== undefined && finalPainScore >= 7;
    setSaving(true);

    const result = await saveAiCheck({
      patientId: demoPatient.id,
      planExerciseId: selectedExercise.id,
      score: aiCheck.score,
      feedback: aiCheck.feedback.join(' '),
      alertType: resolveAiAlert(aiCheck.score, finalPainScore),
      painScore: finalPainScore,
    });

    if (!isHighPain) {
      setCompletedIds((current) => Array.from(new Set([...current, selectedExercise.id])));
    }

    setSaving(false);
    setSaveWasWarning(isHighPain);
    setSaveText(result.demoMode ? 'U ruajt ne demo mode. Supabase aktivizohet kur shtohen env keys.' : 'U ruajt ne Supabase.');
    setScreen('saved');
  }

  function selectPain(score: number) {
    setPainScore(score);
    if (score >= 7) {
      setSaveWasWarning(true);
      setScreen('pain-warning');
      return;
    }
    void saveResult(score);
  }

  const showTopBar = screen !== 'login' && screen !== 'ai-checking';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={screen === 'ai-checking' ? 'light' : 'dark'} />
      {screen === 'ai-checking' ? (
        <AiCheckingScreen exercise={selectedExercise} countdown={countdown} isAnalyzing={isAnalyzing} />
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {showTopBar ? <TopBar onHome={goHome} /> : null}
            {screen === 'login' ? (
              <LoginScreen code={code} setCode={setCode} error={loginError} onLogin={handleLogin} />
            ) : null}
            {screen === 'plan' ? (
              <PlanScreen completedIds={completedIds} progress={progress} onOpenExercise={openExercise} />
            ) : null}
            {screen === 'exercise' ? (
              <ExerciseScreen exercise={selectedExercise} onBack={() => setScreen('plan')} onAi={() => setScreen('ai-prep')} onPain={() => setScreen('pain')} />
            ) : null}
            {screen === 'ai-prep' ? (
              <AiPrepScreen exercise={selectedExercise} onBack={() => setScreen('exercise')} onStart={() => setScreen('ai-checking')} />
            ) : null}
            {screen === 'ai-result' ? (
              <AiResultScreen alertType={alertType} onPain={() => setScreen('pain')} />
            ) : null}
            {screen === 'pain' ? <PainScreen saving={saving} onSelect={selectPain} /> : null}
            {screen === 'pain-warning' ? (
              <PainWarningScreen painScore={painScore ?? 7} saving={saving} onSave={() => void saveResult()} onBack={() => setScreen('pain')} />
            ) : null}
            {screen === 'saved' ? (
              <SavedScreen
                exercise={selectedExercise}
                painScore={painScore}
                saveText={saveText}
                warning={saveWasWarning}
                onDone={() => setScreen('plan')}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function LoginScreen({
  code,
  setCode,
  error,
  onLogin,
}: {
  code: string;
  setCode: (value: string) => void;
  error: string;
  onLogin: () => void;
}) {
  return (
    <View style={styles.stack}>
      <View style={styles.loginHero}>
        <View style={styles.heroTop}>
          <BrandMark size="large" />
          <Pill label="Patient app" tone="info" />
        </View>
        <Text style={styles.heroTitle}>Plani yt i fizioterapise, cdo dite ne telefon.</Text>
        <Text style={styles.heroText}>
          Hyr me kodin e pacientit, ndiq ushtrimet, kontrollo levizjen me AI dhe raporto dhimbjen me siguri.
        </Text>
        <View style={styles.metricRow}>
          <Metric label="Demo plan" value="Dita 3/14" />
          <Metric label="Safety rule" value="7/10 stop" tone="warning" />
        </View>
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>Hyrje e sigurt</Text>
            <Text style={styles.title}>Kodi i pacientit</Text>
          </View>
          <Pill label="Pa account" tone="success" />
        </View>
        <Text style={styles.bodyText}>Kodi lidhet vetem me planin qe ka krijuar fizioterapeuti per ty.</Text>
        <View style={styles.inputShell}>
          <Text style={styles.inputPrefix}>CODE</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="ARB-4821"
            placeholderTextColor={colors.muted}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label="Hyr ne plan" onPress={onLogin} />
        <Text style={styles.helperText}>Demo code: ARB-4821</Text>
      </Card>

      <SafetyAlert compact />
    </View>
  );
}

function PlanScreen({
  completedIds,
  progress,
  onOpenExercise,
}: {
  completedIds: string[];
  progress: number;
  onOpenExercise: (exercise: Exercise) => void;
}) {
  return (
    <View style={styles.stack}>
      <View style={styles.planHero}>
        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <Text style={styles.darkLabel}>Pacienti</Text>
            <Text style={styles.darkTitle}>{demoPatient.name}</Text>
          </View>
          <ProgressRing value={progress} inverse />
        </View>
        <Text style={styles.darkText}>{demoPatient.planTitle}</Text>
        <View style={styles.pillRow}>
          <Pill label={demoPatient.diagnosis} tone="dark" />
          <Pill label={demoPatient.physio} tone="dark" />
        </View>
      </View>

      <View style={styles.dayRail}>
        {demoDays.map((day) => (
          <View key={day.label} style={[styles.dayItem, day.active ? styles.dayItemActive : null]}>
            <Text style={[styles.dayLabel, day.active ? styles.dayLabelActive : null]}>{day.label}</Text>
            <Text style={[styles.dayState, day.active ? styles.dayLabelActive : null]}>{day.state}</Text>
          </View>
        ))}
      </View>

      <View style={styles.metricRow}>
        <StatusPanel label="Ushtrime" value={`${completedIds.length}/${demoExercises.length}`} tone="success" />
        <StatusPanel label="AI checks" value="3 aktiv" tone="info" />
        <StatusPanel label="Risk rule" value="7/10" tone="warning" />
      </View>

      <Text style={styles.sectionTitle}>Plani i sotem</Text>
      {demoExercises.map((exercise, index) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          index={index}
          completed={completedIds.includes(exercise.id)}
          onPress={() => onOpenExercise(exercise)}
        />
      ))}
    </View>
  );
}

function ExerciseScreen({
  exercise,
  onBack,
  onAi,
  onPain,
}: {
  exercise: Exercise;
  onBack: () => void;
  onAi: () => void;
  onPain: () => void;
}) {
  return (
    <View style={styles.stack}>
      <Button label="Kthehu te plani" onPress={onBack} variant="ghost" />
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>Ushtrimi</Text>
            <Text style={styles.title}>{exercise.name}</Text>
          </View>
          <Pill label={exercise.aiEnabled ? 'AI aktiv' : 'Manual'} tone={exercise.aiEnabled ? 'info' : 'warning'} />
        </View>
        <VisualPanel label="Udhezim levizjeje" mode="movement" />
        <InfoRow label="Doza" value={exercise.meta} />
        <InfoRow label="Koha" value={exercise.duration} />
        <InfoRow label="Fokusi" value={exercise.focus} />
        <Text style={styles.bodyText}>{exercise.instructions}</Text>
        <SafetyAlert compact />
        {exercise.aiEnabled ? <Button label="Kontrollo levizjen me kamere" onPress={onAi} /> : null}
        <Button label="E perfundova ushtrimin" onPress={onPain} variant="secondary" />
      </Card>
    </View>
  );
}

function AiPrepScreen({ exercise, onBack, onStart }: { exercise: Exercise; onBack: () => void; onStart: () => void }) {
  return (
    <View style={styles.stack}>
      <Button label="Kthehu te ushtrimi" onPress={onBack} variant="ghost" />
      <Card>
        <Text style={styles.eyebrow}>AI Movement Check</Text>
        <Text style={styles.title}>Pergatitu per kontrollin</Text>
        <Text style={styles.bodyText}>{exercise.name} analizohet si feedback i levizjes. Nuk eshte diagnoze.</Text>
        <VisualPanel label="Telefoni duhet ta shohe trupin qarte" mode="phone" />
        {aiCheck.readiness.map((item) => (
          <ChecklistItem key={item} text={item} />
        ))}
        <SafetyAlert compact />
        <Button label="Fillo kontrollin" onPress={onStart} />
      </Card>
    </View>
  );
}

function AiCheckingScreen({ exercise, countdown, isAnalyzing }: { exercise: Exercise; countdown: number; isAnalyzing: boolean }) {
  return (
    <View style={styles.aiScreen}>
      <Text style={styles.aiKicker}>AI Movement Check</Text>
      <Text style={styles.aiTitle}>{exercise.name}</Text>
      <CameraFrame active={isAnalyzing} />
      {isAnalyzing ? (
        <View style={styles.aiState}>
          <ActivityIndicator color={colors.success} size="large" />
          <Text style={styles.aiHint}>Duke analizuar levizjen...</Text>
        </View>
      ) : (
        <View style={styles.aiState}>
          <Text style={styles.aiHint}>Fillo ushtrimin kur te jesh gati</Text>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      )}
    </View>
  );
}

function AiResultScreen({ alertType, onPain }: { alertType: ReturnType<typeof resolveAiAlert>; onPain: () => void }) {
  return (
    <Card>
      <Text style={styles.eyebrow}>Rezultati i AI</Text>
      <View style={styles.resultHeader}>
        <View>
          <Text style={styles.score}>{aiCheck.score}%</Text>
          <Text style={styles.scoreLabel}>Movement quality</Text>
        </View>
        <Pill label={alertType === 'good' ? 'Stabil' : 'Kujdes'} tone={alertType === 'good' ? 'success' : 'warning'} />
      </View>
      <Text style={styles.title}>Levizje e kontrolluar</Text>
      {aiCheck.feedback.map((item) => (
        <ChecklistItem key={item} text={item} />
      ))}
      <SafetyAlert compact />
      <Button label="Raporto dhimbjen" onPress={onPain} />
    </Card>
  );
}

function PainScreen({ saving, onSelect }: { saving: boolean; onSelect: (score: number) => void }) {
  return (
    <Card>
      <Text style={styles.eyebrow}>Siguria</Text>
      <Text style={styles.title}>Sa dhimbje pate gjate ushtrimit?</Text>
      <Text style={styles.bodyText}>Zgjedh nje numer nga 0 deri 10. Te 7 ose me shume, ndalo dhe kontakto fizioterapeutin.</Text>
      <PainScale value={null} onSelect={onSelect} getTone={getPainTone} />
      {saving ? <ActivityIndicator color={colors.teal} style={styles.loader} /> : null}
    </Card>
  );
}

function PainWarningScreen({
  painScore,
  saving,
  onSave,
  onBack,
}: {
  painScore: number;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <Card tone="danger">
      <View style={styles.warningBadge}>
        <Text style={styles.warningBadgeText}>!</Text>
      </View>
      <Text style={styles.title}>Ndalo ushtrimin</Text>
      <Text style={styles.bodyText}>
        Dhimbja eshte {painScore}/10. Kjo nuk ruhet si sukses i zakonshem. Kontakto fizioterapeutin para se te vazhdosh.
      </Text>
      <Button label={saving ? 'Duke ruajtur...' : 'Ruaj warning dhe njofto'} onPress={onSave} disabled={saving} />
      <Button label="Ndrysho pain score" onPress={onBack} variant="secondary" disabled={saving} />
    </Card>
  );
}

function SavedScreen({
  exercise,
  painScore,
  saveText,
  warning,
  onDone,
}: {
  exercise: Exercise;
  painScore: number | null;
  saveText: string;
  warning: boolean;
  onDone: () => void;
}) {
  return (
    <Card tone={warning ? 'warning' : 'success'}>
      <View style={[styles.savedBadge, warning ? styles.savedBadgeWarning : null]}>
        <Text style={[styles.savedBadgeText, warning ? styles.savedBadgeTextWarning : null]}>{warning ? '!' : 'OK'}</Text>
      </View>
      <Text style={styles.title}>{warning ? 'Warning u ruajt' : 'Seanca u ruajt'}</Text>
      <Text style={styles.bodyText}>
        {warning ? 'Fizioterapeuti duhet kontaktuar para vazhdimit.' : saveText || 'Rezultati u ruajt.'}
      </Text>
      <InfoRow label="Ushtrimi" value={exercise.name} />
      <InfoRow label="AI score" value={`${aiCheck.score}%`} />
      <InfoRow label="Dhimbja" value={painScore == null ? 'Pa raport' : `${painScore}/10`} />
      <Button label="Kthehu te plani" onPress={onDone} />
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 44,
  },
  stack: {
    gap: spacing.md,
  },
  loginHero: {
    minHeight: 338,
    borderRadius: 8,
    padding: 22,
    backgroundColor: colors.ink,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.ink,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 35,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 24,
  },
  heroText: {
    color: colors.whiteSoft,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 6,
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 10,
  },
  bodyText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 12,
    minHeight: 58,
  },
  inputPrefix: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  input: {
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  errorText: {
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerLine,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  planHero: {
    borderRadius: 8,
    padding: 18,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.ink,
    gap: spacing.md,
  },
  darkLabel: {
    color: colors.whiteMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  darkTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 2,
  },
  darkText: {
    color: colors.whiteSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayRail: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayItemActive: {
    backgroundColor: colors.tealSoft,
    borderColor: colors.tealLine,
  },
  dayLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  dayState: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  dayLabelActive: {
    color: colors.tealDark,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: 10,
  },
  score: {
    color: colors.teal,
    fontSize: 68,
    lineHeight: 74,
    fontWeight: '900',
    letterSpacing: 0,
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  loader: {
    marginTop: 16,
  },
  warningBadge: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  warningBadgeText: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '900',
  },
  savedBadge: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successLine,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  savedBadgeWarning: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningLine,
  },
  savedBadgeText: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '900',
  },
  savedBadgeTextWarning: {
    color: colors.warning,
  },
  aiScreen: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingTop: 76,
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiKicker: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 8,
  },
  aiTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 22,
  },
  aiState: {
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  aiHint: {
    color: colors.whiteSoft,
    fontSize: 16,
    textAlign: 'center',
  },
  countdown: {
    color: colors.white,
    fontSize: 82,
    lineHeight: 92,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 8,
  },
});
