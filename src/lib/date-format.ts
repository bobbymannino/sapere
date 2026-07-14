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
