import "server-only";

import { patientSessionSigningConfigured } from "@/lib/backend-logic";
import { patientSessionRegistryEnabled } from "@/lib/backend/patient-sessions";
import { checkDatabaseReadiness } from "@/lib/backend/schema-readiness";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AdminProfileSummary = {
  id: string;
  email: string;
  fullName: string | null;
  clinicName: string | null;
  role: string;
  status: string | null;
  createdAt: string | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
};

export type AdminAuditSummary = {
  id: string;
  action: string;
  actorRole: string | null;
  entityType: string;
  createdAt: string | null;
};

export type AdminDashboardData = {
  configured: boolean;
  metrics: {
    physiotherapists: number;
    activePhysiotherapists: number;
    activeSubscriptions: number;
    patients: number;
    activePatients: number;
    activePlans: number;
    highPainAlerts: number;
    lowMovementScoreAlerts: number;
    notificationFailures: number;
  };
  readiness: {
    database: boolean;
    schema: boolean;
    patientSessionSigning: boolean;
    patientSessionRegistry: boolean;
    schemaVersion: string | null;
    expectedSchemaVersion: string;
  };
  profiles: AdminProfileSummary[];
  audit: AdminAuditSummary[];
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  clinic_name: string | null;
  role: string;
  status: string | null;
  created_at: string | null;
  subscriptions?: Array<{
    status: string | null;
    current_period_end: string | null;
    created_at: string | null;
  }>;
};

type AuditRow = {
  id: string;
  action: string;
  actor_role: string | null;
  entity_type: string;
  created_at: string | null;
};

function countOf(result: { count: number | null }) {
  return result.count ?? 0;
}

function latestSubscription(profile: ProfileRow) {
  return [...(profile.subscriptions ?? [])].sort(
    (left, right) =>
      new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime(),
  )[0] ?? null;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      configured: false,
      metrics: {
        physiotherapists: 0,
        activePhysiotherapists: 0,
        activeSubscriptions: 0,
        patients: 0,
        activePatients: 0,
        activePlans: 0,
        highPainAlerts: 0,
        lowMovementScoreAlerts: 0,
        notificationFailures: 0,
      },
      readiness: {
        database: false,
        schema: false,
        patientSessionSigning: patientSessionSigningConfigured(),
        patientSessionRegistry: patientSessionRegistryEnabled(),
        schemaVersion: null,
        expectedSchemaVersion: "unknown",
      },
      profiles: [],
      audit: [],
    };
  }

  const now = new Date().toISOString();
  const [
    physiotherapists,
    activePhysiotherapists,
    activeSubscriptions,
    patients,
    activePatients,
    activePlans,
    highPainAlerts,
    lowMovementScoreAlerts,
    notificationFailures,
    profileRows,
    auditRows,
    readiness,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "physio"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "physio")
      .eq("status", "active"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gt("current_period_end", now),
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("archived_at", null),
    supabase
      .from("plans")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("exercise_logs")
      .select("id", { count: "exact", head: true })
      .gte("pain_score", 7),
    supabase
      .from("ai_checks")
      .select("id", { count: "exact", head: true })
      .lt("score", 60),
    supabase
      .from("notification_logs")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("profiles")
      .select(
        "id,email,full_name,clinic_name,role,status,created_at,subscriptions(status,current_period_end,created_at)",
      )
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<ProfileRow[]>(),
    supabase
      .from("audit_logs")
      .select("id,action,actor_role,entity_type,created_at")
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<AuditRow[]>(),
    checkDatabaseReadiness(supabase),
  ]);

  const databaseErrors = [
    physiotherapists.error,
    activePhysiotherapists.error,
    activeSubscriptions.error,
    patients.error,
    activePatients.error,
    activePlans.error,
    highPainAlerts.error,
    lowMovementScoreAlerts.error,
    notificationFailures.error,
    profileRows.error,
    auditRows.error,
  ].filter(Boolean);

  return {
    configured: databaseErrors.length === 0,
    metrics: {
      physiotherapists: countOf(physiotherapists),
      activePhysiotherapists: countOf(activePhysiotherapists),
      activeSubscriptions: countOf(activeSubscriptions),
      patients: countOf(patients),
      activePatients: countOf(activePatients),
      activePlans: countOf(activePlans),
      highPainAlerts: countOf(highPainAlerts),
      lowMovementScoreAlerts: countOf(lowMovementScoreAlerts),
      notificationFailures: countOf(notificationFailures),
    },
    readiness: {
      database: databaseErrors.length === 0,
      schema: readiness.ready,
      patientSessionSigning: patientSessionSigningConfigured(),
      patientSessionRegistry: patientSessionRegistryEnabled(),
      schemaVersion: readiness.schemaVersion,
      expectedSchemaVersion: readiness.expectedSchemaVersion,
    },
    profiles: (profileRows.data ?? []).map((profile) => {
      const subscription = latestSubscription(profile);
      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        clinicName: profile.clinic_name,
        role: profile.role,
        status: profile.status,
        createdAt: profile.created_at,
        subscriptionStatus: subscription?.status ?? null,
        subscriptionEndsAt: subscription?.current_period_end ?? null,
      };
    }),
    audit: (auditRows.data ?? []).map((entry) => ({
      id: entry.id,
      action: entry.action,
      actorRole: entry.actor_role,
      entityType: entry.entity_type,
      createdAt: entry.created_at,
    })),
  };
}
