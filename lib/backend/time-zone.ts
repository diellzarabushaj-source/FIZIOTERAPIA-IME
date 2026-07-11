export const CLINIC_TIME_ZONE = "Europe/Belgrade";

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getZonedParts(date: Date, timeZone: string): ZonedDateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return values as ZonedDateParts;
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone);
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  ) - date.getTime();
}

function localDateTimeUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
) {
  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let candidate = new Date(wallClockUtc - getTimeZoneOffsetMs(new Date(wallClockUtc), timeZone));

  // Recalculate at the resolved instant so daylight-saving transitions remain correct.
  candidate = new Date(wallClockUtc - getTimeZoneOffsetMs(candidate, timeZone));
  return candidate;
}

function localMidnightUtc(year: number, month: number, day: number, timeZone: string) {
  return localDateTimeUtc(year, month, day, 0, 0, 0, timeZone);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getClinicDateInput(now = new Date(), timeZone = CLINIC_TIME_ZONE) {
  const local = getZonedParts(now, timeZone);
  return `${local.year}-${pad(local.month)}-${pad(local.day)}`;
}

export function getClinicDateTimeInput(now = new Date(), timeZone = CLINIC_TIME_ZONE) {
  const local = getZonedParts(now, timeZone);
  return `${local.year}-${pad(local.month)}-${pad(local.day)}T${pad(local.hour)}:${pad(local.minute)}`;
}

export function clinicDateTimeInputToUtc(value: string, timeZone = CLINIC_TIME_ZONE): Date | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  const calendarCheck = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() + 1 !== month ||
    calendarCheck.getUTCDate() !== day ||
    calendarCheck.getUTCHours() !== hour ||
    calendarCheck.getUTCMinutes() !== minute
  ) {
    return null;
  }

  const resolved = localDateTimeUtc(year, month, day, hour, minute, 0, timeZone);
  const local = getZonedParts(resolved, timeZone);
  if (
    local.year !== year ||
    local.month !== month ||
    local.day !== day ||
    local.hour !== hour ||
    local.minute !== minute
  ) {
    // Reject local clock times that do not exist during a DST transition.
    return null;
  }

  return resolved;
}

export function clinicDateInputToUtcNoon(value: string, timeZone = CLINIC_TIME_ZONE): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return clinicDateTimeInputToUtc(`${value}T12:00`, timeZone);
}

export function getUtcDayRange(now = new Date(), timeZone = CLINIC_TIME_ZONE) {
  const local = getZonedParts(now, timeZone);
  const start = localMidnightUtc(local.year, local.month, local.day, timeZone);
  const nextLocalDate = new Date(Date.UTC(local.year, local.month - 1, local.day + 1));
  const end = localMidnightUtc(
    nextLocalDate.getUTCFullYear(),
    nextLocalDate.getUTCMonth() + 1,
    nextLocalDate.getUTCDate(),
    timeZone,
  );

  return { start, end, timeZone };
}
