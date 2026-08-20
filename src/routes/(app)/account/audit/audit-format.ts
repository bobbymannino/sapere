import type { ActorAuditLog } from "$db/audit";
import { UAParser } from "ua-parser-js";

/**
 * Build a human readable label for a log's metadata
 *
 * @param log The audit log to describe
 * @returns A label, or an empty string when there is nothing to show
 */
export function metadataLabel({ action, metadata }: Pick<ActorAuditLog, "action" | "metadata">) {
  const title = typeof metadata.title === "string" ? metadata.title : "";
  const name = typeof metadata.name === "string" ? metadata.name : "";

  if (action.startsWith("workspace.") && title) return `Workspace: ${title}`;
  if (action.startsWith("document.") && title) return `Document: ${title}`;
  if (action === "user.passkey.added" && name) return `Passkey: ${name}`;
  return "";
}

/**
 * Build a human readable label for a log's user agent
 *
 * @param userAgent The raw user agent string
 * @returns A label, or an empty string when nothing could be parsed
 */
export function userAgentLabel(userAgent: ActorAuditLog["userAgent"]) {
  if (!userAgent) return "";

  const ua = new UAParser(userAgent).getResult();
  const device = `${ua.device.vendor ?? ""} ${ua.device.model ?? ""}`;
  const browser = `${ua.browser.name ?? ""} ${ua.browser.major ? `v${ua.browser.major}` : ""}`;
  const os = `${ua.os.name ?? ""} ${ua.os.version ?? ""}`;

  return [device, os, browser]
    .map((part) => part.trim())
    .filter((part) => /\w/.test(part))
    .join(" • ");
}
