const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "long",
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const shortDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

type DateValue = Date | string;

function toDate(value: DateValue) {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value: DateValue) {
  return dateFormatter.format(toDate(value));
}

/**
 * Format a date into a localized date time string
 *
 * @param value The date to format
 * @returns A localized date time string
 */
export function formatDateTime(value: DateValue) {
  return dateTimeFormatter.format(toDate(value));
}

/**
 * Format a date into a localized short date time string
 *
 * @param value The date to format
 * @returns A localized short date time string
 */
export function formatShortDateTime(value: DateValue) {
  return shortDateTimeFormatter.format(toDate(value));
}

/**
 * Convert a date to an ISO date string
 *
 * @param value The date to convert
 * @returns An ISO date string
 */
export function toIsoDate(value: DateValue) {
  return toDate(value).toISOString();
}

const RELATIVE_TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
];

/**
 * Format a date into a localized relative time string (e.g. "2 days ago")
 *
 * @param value The date to format
 * @returns A localized relative time string
 */
export function formatRelativeDate(value: DateValue) {
  const diffMs = toDate(value).getTime() - Date.now();

  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (Math.abs(diffMs) >= ms) {
      return relativeTimeFormatter.format(Math.round(diffMs / ms), unit);
    }
  }

  return relativeTimeFormatter.format(Math.round(diffMs / 1000), "second");
}
