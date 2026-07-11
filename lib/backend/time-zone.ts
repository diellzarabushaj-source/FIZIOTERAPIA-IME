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

function localMidnightUtc(year: number, month: number, day: number, timeZone: string) {
  const wallClockUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
  let candidate = new Date(wallClockUtc - getTimeZoneOffsetMs(new Date(wallClockUtc), timeZone));

  // Recalculate once at the resolved instant so DST transition days remain correct.
  candidate = new Date(wallClockUtc - getTimeZoneOffsetMs(candidate, timeZone));
  return candidate;
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
