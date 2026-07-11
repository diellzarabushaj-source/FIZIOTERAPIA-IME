import { randomBytes } from "node:crypto";
import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, optionalText } from "@/lib/backend/validation";
import { canCreateAnotherPatient, FREE_PATIENT_LIMIT