import { readFile, writeFile } from "node:fs/promises";

const linkFiles = [
  "app/admin-hidden/page.tsx",
  "app/blog/[slug]/page.tsx",
  "app/blog/page.tsx",
  "app/launch-checklist/page.tsx",
  "app/page.tsx",
  "app/physiotherapist-dashboard/page.tsx",
  "app/pilot-feedback/page.tsx",
  "app/pilot-feedback/success/page.tsx",
  "app/pilot-onboarding/page.tsx",
  "app/product-flow/page.tsx",
  "app/qa-checklist/page.tsx",
  "components/LegalPage.tsx",
  "components/PatientSessionClient.tsx",
];

const internalAnchorPattern = /<a(\s+[^>]*href=["']\/(?!\/)[^"']*["'][^>]*)>([\s\S]*?)<\/a>/g;

async function updateSource(file, transform) {
  const original = await readFile(file, "utf8");
  const updated = transform(original);
  if (updated === original) return;
  await writeFile(file, updated);
  console.log(`Updated ${file}`);
}

for (const file of linkFiles) {
  await updateSource(file, (original) => {
    let source = original.replace(internalAnchorPattern, "<Link$1>$2</Link>");
    if (source === original) return source;
    if (!source.includes('from "next/link"') && !source.includes("from 'next/link'")) {
      const directive = '"use client";\n\n';
      source = source.startsWith(directive)
        ? `${directive}import Link from "next/link";\n`
        : `import Link from "next/link";\n${source}`;
    }
    return source;
  });
}

await updateSource("app/physiotherapist-portal/patients/[patientId]/page.tsx", (original) => {
  let source = original.replace(
    'import { CLINIC_TIME_ZONE } from "@/lib/backend/time-zone";',
    'import { CLINIC_TIME_ZONE, getClinicDateTimeInput } from "@/lib/backend/time-zone";',
  );
  if (!source.includes("const schedulingMinimum")) {
    source = source.replace(
      '  const accessRotated = notices.access === "rotated";\n\n  return (',
      '  const accessRotated = notices.access === "rotated";\n  const schedulingMinimum = getClinicDateTimeInput();\n  const nextSchedulingHour = new Date(Date.now() + 60 * 60_000);\n  nextSchedulingHour.setMinutes(0, 0, 0);\n  const initialScheduledAt = getClinicDateTimeInput(nextSchedulingHour);\n\n  return (',
    );
  }
  source = source.replace(
    '<ScheduleSessionForm patientId={patientId} />',
    '<ScheduleSessionForm patientId={patientId} minimumScheduledAt={schedulingMinimum} initialScheduledAt={initialScheduledAt} />',
  );
  return source;
});

await updateSource("app/physiotherapist-portal/patients/new/NewPatientForm.tsx", (original) => {
  let source = original.replace(
    '    if (!canCheck) {\n      setMatches({ exact: null, similar: [] });\n      setCheckMessage("");\n      setChecking(false);\n      return;\n    }',
    '    if (!canCheck) return;',
  );
  if (!source.includes("const visibleMatches")) {
    source = source.replace(
      '  }, [canCheck, firstName, lastName, dateOfBirth, phone]);\n\n  return (',
      '  }, [canCheck, firstName, lastName, dateOfBirth, phone]);\n\n  const visibleMatches = canCheck ? matches : { exact: null, similar: [] };\n  const visibleChecking = canCheck && checking;\n  const visibleCheckMessage = canCheck ? checkMessage : "";\n\n  return (',
    );
  }
  source = source
    .replaceAll("matches.exact", "visibleMatches.exact")
    .replaceAll("matches.similar", "visibleMatches.similar")
    .replaceAll("{checking ? styles", "{visibleChecking ? styles")
    .replaceAll("<strong>{checking ?", "<strong>{visibleChecking ?")
    .replaceAll("{checking\n              ?", "{visibleChecking\n              ?")
    .replaceAll("{checkMessage && (", "{visibleCheckMessage && (")
    .replaceAll("{checkMessage}", "{visibleCheckMessage}");
  return source;
});

await updateSource("components/PatientNetworkStatus.tsx", (original) => {
  let source = original.replace(
    '    setOnline(navigator.onLine);\n\n    const handleOffline',
    '    const initialStatusTimer = window.setTimeout(() => setOnline(navigator.onLine), 0);\n\n    const handleOffline',
  );
  source = source.replace(
    '    return () => {\n      window.removeEventListener("offline", handleOffline);',
    '    return () => {\n      window.clearTimeout(initialStatusTimer);\n      window.removeEventListener("offline", handleOffline);',
  );
  return source;
});

await updateSource("components/PatientReminderSettings.tsx", (original) => {
  if (original.includes("const hydrationTimer")) return original;
  return original.replace(
    `  useEffect(() => {\n    const stored = window.localStorage.getItem("fi_patient_reminder");\n    if (stored) {\n      try {\n        const value = JSON.parse(stored);\n        if (value.time) setTime(value.time);\n        if (Array.isArray(value.days)) setDays(value.days);\n      } catch {}\n    }\n    setPermission("Notification" in window ? Notification.permission : "unsupported");\n  }, []);`,
    `  useEffect(() => {\n    const hydrationTimer = window.setTimeout(() => {\n      const stored = window.localStorage.getItem("fi_patient_reminder");\n      if (stored) {\n        try {\n          const value = JSON.parse(stored);\n          if (value.time) setTime(value.time);\n          if (Array.isArray(value.days)) setDays(value.days);\n        } catch {}\n      }\n      setPermission("Notification" in window ? Notification.permission : "unsupported");\n    }, 0);\n    return () => window.clearTimeout(hydrationTimer);\n  }, []);`,
  );
});

await updateSource("components/PatientSessionClient.tsx", (original) => {
  let source = original;
  if (!source.includes("const [elapsedMinutes")) {
    source = source.replace(
      '  const [sessionStart] = useState(() => Date.now());',
      '  const [sessionStart] = useState(() => Date.now());\n  const [elapsedMinutes, setElapsedMinutes] = useState(1);',
    );
  }
  source = source.replace(
    '  const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));\n',
    '',
  );
  if (!source.includes("elapsedMinutesInterval")) {
    source = source.replace(
      '  useEffect(() => {\n    if (!timerRunning) return;',
      '  useEffect(() => {\n    if (!sessionStarted) return;\n    const elapsedMinutesInterval = window.setInterval(() => {\n      setElapsedMinutes(Math.max(1, Math.round((Date.now() - sessionStart) / 60000)));\n    }, 60_000);\n    return () => window.clearInterval(elapsedMinutesInterval);\n  }, [sessionStart, sessionStarted]);\n\n  useEffect(() => {\n    if (!timerRunning) return;',
    );
  }
  return source;
});

await updateSource("apps/mobile-app/App.tsx", (original) => {
  let source = original.replace(
    `    setCountdown(3);\n    setIsAnalyzing(false);\n    let count = 3;`,
    `    let count = 3;`,
  );
  if (!source.includes("function startAiCheck")) {
    source = source.replace(
      `  function selectPain(score: number) {\n    setPainScore(score);\n    if (score >= 7) {\n      setScreen('pain-warning');\n    } else {\n      void saveResult(score);\n    }\n  }\n\n  return (`,
      `  function selectPain(score: number) {\n    setPainScore(score);\n    if (score >= 7) {\n      setScreen('pain-warning');\n    } else {\n      void saveResult(score);\n    }\n  }\n\n  function startAiCheck() {\n    setCountdown(3);\n    setIsAnalyzing(false);\n    setScreen('ai-checking');\n  }\n\n  return (`,
    );
  }
  source = source.replace(
    "onPress={() => setScreen('ai-checking')}",
    "onPress={startAiCheck}",
  );
  return source;
});
