"use client";

import {
  Activity,
  Baby,
  BarChart3,
  Bone,
  BookOpen,
  Bot,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleHelp,
  Clock3,
  CreditCard,
  Dumbbell,
  FileQuestion,
  FileText,
  Footprints,
  HeartPulse,
  House,
  KeyRound,
  Library,
  LockKeyhole,
  Mail,
  MessageCircle,
  Phone,
  PlayCircle,
  QrCode,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  Video,
  XCircle,
} from "@/components/LucideIcons";

const icons = {
  activity: Activity,
  baby: Baby,
  bone: Bone,
  book: BookOpen,
  bot: Bot,
  building: Building2,
  calendar: CalendarDays,
  camera: Camera,
  check: CheckCircle2,
  clock: Clock3,
  document: FileText,
  dumbbell: Dumbbell,
  fileHelp: FileQuestion,
  foot: Footprints,
  help: CircleHelp,
  home: House,
  key: KeyRound,
  library: Library,
  lock: LockKeyhole,
  mail: Mail,
  message: MessageCircle,
  pain: HeartPulse,
  payment: CreditCard,
  phone: Phone,
  play: PlayCircle,
  progress: BarChart3,
  qr: QrCode,
  rocket: Rocket,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  smartphone: Smartphone,
  sparkles: Sparkles,
  physio: Stethoscope,
  trash: Trash2,
  trend: TrendingUp,
  user: UserRound,
  users: Users,
  video: Video,
  remove: XCircle,
} as const;

export type UiIconName = keyof typeof icons;

export function UiIcon({
  name,
  size = 22,
  className,
  label,
}: {
  name: UiIconName;
  size?: number;
  className?: string;
  label?: string;
}) {
  const Icon = icons[name];

  return (
    <span className={className ? `ui-icon-token ${className}` : "ui-icon-token"} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}
