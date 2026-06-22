const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "long",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

type DateValue = Date | string;

function toDate(value: DateValue) {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value: DateValue) {
  return dateFormatter.format(toDate(value));
}

export function formatDateTime(value: DateValue) {
  return dateTimeFormatter.format(toDate(value));
}

export function toIsoDate(value: DateValue) {
  return toDate(value).toISOString();
}
