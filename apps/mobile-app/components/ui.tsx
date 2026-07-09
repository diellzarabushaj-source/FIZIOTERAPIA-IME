import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, softShadow, spacing, toneStyles, type Tone } from '../theme';
import type { Exercise } from '../data/demo';
import { gentleTap } from '../lib/haptics';

export function TopBar({ onHome }: { onHome: () => void }) {
  return (
    <TouchableOpacity style={styles.topBar} onPress={onHome} activeOpacity={0.84}>
      <BrandMark size="small" />
      <View style={styles.flex}>
        <Text style={styles.topTitle}>Fizioterapia ime</Text>
        <Text style={styles.topSub}>Patient recovery app</Text>
      </View>
      <Pill label="MVP" tone="success" compact />
    </TouchableOpacity>
  );
}

export function BrandMark({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeStyle = size === 'large' ? styles.brandLarge : size === 'small' ? styles.brandSmall : styles.brand;
  return (
    <View style={[styles.brand, sizeStyle]}>
      <Text style={[styles.brandText, size === 'large' ? styles.brandTextLarge : null]}>FI</Text>
    </View>
  );
}

export function Card({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  return <View style={[styles.card, tone !== 'neutral' ? { backgroundColor: toneStyles[tone].bg, borderColor: toneStyles[tone].border } : null]}>{children}</View>;
}

export function Pill({ label, tone = 'neutral', compact = false }: { label: string; tone?: Tone; compact?: boolean }) {
  const palette = toneStyles[tone];
  return (
    <View style={[styles.pill, compact ? styles.pillCompact : null, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.pillText, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}) {
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  async function handlePress() {
    if (disabled || loading) return;
    await gentleTap();
    onPress();
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary ? styles.buttonSecondary : null,
        isGhost ? styles.buttonGhost : null,
        disabled || loading ? styles.buttonDisabled : null,
      ]}
      onPress={handlePress}
      activeOpacity={0.86}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color={isSecondary || isGhost ? colors.ink : colors.white} /> : null}
      <Text style={[styles.buttonText, isSecondary || isGhost ? styles.buttonTextSecondary : null]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Metric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: Tone }) {
  const palette = toneStyles[tone];
  return (
    <View style={[styles.metric, tone !== 'neutral' ? { backgroundColor: palette.bg, borderColor: palette.border } : null]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function StatusPanel({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const palette = toneStyles[tone];
  return (
    <View style={[styles.statusPanel, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, { color: palette.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function SafetyAlert({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.safety, compact ? styles.safetyCompact : null]}>
      <Text style={styles.safetyLabel}>Safety rule</Text>
      <Text style={styles.safetyText}>Dhimbje 7/10 ose me shume = ndalo ushtrimin dhe kontakto fizioterapeutin.</Text>
    </View>
  );
}

export function ExerciseCard({
  exercise,
  index,
  completed,
  onPress,
}: {
  exercise: Exercise;
  index: number;
  completed: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.exercise, completed ? styles.exerciseDone : null]} onPress={onPress} activeOpacity={0.86}>
      <View style={[styles.exerciseIndex, completed ? styles.exerciseIndexDone : null]}>
        <Text style={[styles.exerciseIndexText, completed ? styles.exerciseIndexTextDone : null]}>{completed ? 'OK' : String(index + 1).padStart(2, '0')}</Text>
      </View>
      <View style={styles.flex}>
        <View style={styles.exerciseTitleRow}>
          <Text style={styles.exerciseTitle} numberOfLines={1}>
            {exercise.name}
          </Text>
          {exercise.aiEnabled ? <Pill label="AI" tone="info" compact /> : null}
        </View>
        <Text style={styles.exerciseMeta} numberOfLines={1}>
          {exercise.meta} - {exercise.duration}
        </Text>
        <Text style={styles.exerciseFocus} numberOfLines={1}>
          {exercise.focus}
        </Text>
      </View>
      <Text style={styles.chevron}>{'>'}</Text>
    </TouchableOpacity>
  );
}

export function ProgressRing({ value, inverse = false }: { value: number; inverse?: boolean }) {
  return (
    <View style={[styles.progressRing, inverse ? styles.progressRingInverse : null]}>
      <Text style={[styles.progressValue, inverse ? styles.progressValueInverse : null]}>{value}%</Text>
      <Text style={[styles.progressLabel, inverse ? styles.progressLabelInverse : null]}>sot</Text>
    </View>
  );
}

export function CameraFrame({ active }: { active: boolean }) {
  return (
    <View style={styles.cameraFrame}>
      <View style={[styles.corner, styles.cornerTopLeft]} />
      <View style={[styles.corner, styles.cornerTopRight]} />
      <View style={[styles.corner, styles.cornerBottomLeft]} />
      <View style={[styles.corner, styles.cornerBottomRight]} />
      <View style={styles.bodyGuide}>
        <View style={styles.head} />
        <View style={styles.bodyLine} />
        <View style={styles.armLine} />
        <View style={styles.legLine} />
      </View>
      <View style={[styles.scanLine, active ? styles.scanLineActive : null]} />
      <Text style={styles.cameraLabel}>camera preview simulation</Text>
    </View>
  );
}

export function PainScale({
  value,
  onSelect,
  getTone,
}: {
  value: number | null;
  onSelect: (score: number) => void;
  getTone: (score: number) => Tone;
}) {
  return (
    <View style={styles.painGrid}>
      {Array.from({ length: 11 }, (_, score) => {
        const tone = getTone(score);
        const palette = toneStyles[tone];
        return (
          <TouchableOpacity
            key={score}
            style={[
              styles.painButton,
              { backgroundColor: palette.bg, borderColor: value === score ? palette.text : palette.border },
            ]}
            onPress={() => onSelect(score)}
            activeOpacity={0.84}
          >
            <Text style={[styles.painText, { color: palette.text }]}>{score}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function VisualPanel({ label, mode }: { label: string; mode: 'movement' | 'phone' }) {
  return (
    <View style={styles.visual}>
      {mode === 'phone' ? (
        <View style={styles.phone}>
          <View style={styles.phoneCamera} />
          <View style={styles.phoneTarget} />
        </View>
      ) : (
        <View style={styles.motionGuide}>
          <View style={styles.motionHead} />
          <View style={styles.motionBody} />
          <View style={styles.motionArm} />
          <View style={styles.motionLeg} />
        </View>
      )}
      <Text style={styles.visualLabel}>{label}</Text>
    </View>
  );
}

export function ChecklistItem({ text }: { text: string }) {
  return (
    <View style={styles.checkItem}>
      <View style={styles.checkMark}>
        <Text style={styles.checkMarkText}>OK</Text>
      </View>
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const cardBase = {
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surface,
} as const;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 48,
  },
  topTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  topSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  brand: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSmall: {
    width: 44,
    height: 44,
  },
  brandLarge: {
    width: 72,
    height: 72,
    backgroundColor: colors.white,
  },
  brandText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandTextLarge: {
    color: colors.ink,
    fontSize: 24,
  },
  card: {
    ...cardBase,
    padding: spacing.lg,
    ...softShadow,
  },
  pill: {
    maxWidth: 190,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillCompact: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '900',
  },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonSecondary: {
    backgroundColor: colors.tealSoft,
    borderWidth: 1,
    borderColor: colors.tealLine,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.62,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  buttonTextSecondary: {
    color: colors.ink,
  },
  metric: {
    ...cardBase,
    flex: 1,
    padding: 13,
    minHeight: 82,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  metricLabel: {
    color: colors.whiteMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  metricValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  statusPanel: {
    flex: 1,
    minHeight: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'center',
  },
  statusLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  statusValue: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 6,
  },
  safety: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warningLine,
    backgroundColor: colors.warningBg,
    padding: 14,
  },
  safetyCompact: {
    marginTop: 2,
    marginBottom: 6,
  },
  safetyLabel: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 5,
  },
  safetyText: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 19,
  },
  exercise: {
    ...cardBase,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    minHeight: 94,
  },
  exerciseDone: {
    backgroundColor: colors.successBg,
    borderColor: colors.successLine,
  },
  exerciseIndex: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  exerciseIndexDone: {
    backgroundColor: colors.surface,
    borderColor: colors.successLine,
  },
  exerciseIndexText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  exerciseIndexTextDone: {
    color: colors.success,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  exerciseMeta: {
    color: colors.text,
    fontSize: 13,
    marginTop: 4,
  },
  exerciseFocus: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  chevron: {
    color: colors.muted,
    fontSize: 20,
    fontWeight: '900',
  },
  progressRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 8,
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  progressRingInverse: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: colors.success,
  },
  progressValue: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  progressValueInverse: {
    color: colors.white,
  },
  progressLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  progressLabelInverse: {
    color: colors.whiteMuted,
  },
  cameraFrame: {
    width: '100%',
    maxWidth: 440,
    height: 332,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'rgba(98,214,164,0.60)',
    backgroundColor: '#0D1E32',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderColor: colors.success,
  },
  cornerTopLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  bodyGuide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: colors.whiteSoft,
    marginBottom: 8,
  },
  bodyLine: {
    width: 4,
    height: 82,
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.pill,
  },
  armLine: {
    position: 'absolute',
    width: 118,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: radius.pill,
    top: 58,
    transform: [{ rotate: '-8deg' }],
  },
  legLine: {
    position: 'absolute',
    width: 118,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: radius.pill,
    bottom: -4,
    transform: [{ rotate: '22deg' }],
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 3,
    backgroundColor: colors.success,
    opacity: 0.55,
  },
  scanLineActive: {
    opacity: 0.95,
  },
  cameraLabel: {
    position: 'absolute',
    bottom: 18,
    color: colors.whiteMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  painGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  painButton: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  painText: {
    fontSize: 20,
    fontWeight: '900',
  },
  visual: {
    height: 190,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.tealLine,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },
  visualLabel: {
    color: colors.tealDark,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 12,
  },
  phone: {
    width: 86,
    height: 132,
    borderRadius: radius.md,
    borderWidth: 5,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneCamera: {
    position: 'absolute',
    top: 8,
    width: 28,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  phoneTarget: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.teal,
  },
  motionGuide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  motionHead: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: colors.teal,
    marginBottom: 8,
  },
  motionBody: {
    width: 4,
    height: 70,
    borderRadius: radius.pill,
    backgroundColor: colors.teal,
  },
  motionArm: {
    position: 'absolute',
    width: 108,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: '#8FD9CA',
    top: 54,
    transform: [{ rotate: '-8deg' }],
  },
  motionLeg: {
    position: 'absolute',
    width: 108,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: '#8FD9CA',
    bottom: -4,
    transform: [{ rotate: '22deg' }],
  },
  checkItem: {
    ...cardBase,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: 13,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 9,
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '900',
  },
  checkText: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
  },
  infoRow: {
    ...cardBase,
    padding: 13,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 10,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  infoValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3,
  },
});
