/**
 * Seeds the database with a single test user owning a handful of workspaces,
 * each containing a varying number of documents. Realistic column values are
 * produced by `drizzle-seed`; slugs and pins are applied afterwards so they stay
 * consistent with the generated titles.
 *
 * Safe to re-run: existing seed rows are removed first.
 */
import { hashPassword } from "better-auth/crypto";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql/postgres";
import { seed } from "drizzle-seed";
import { Files } from "files-sdk";
import { fs } from "files-sdk/fs";

import * as s from "../src/lib/server/db/schema.ts";

const TEST_USER = {
  id: "seed-user-test",
  name: "Test User",
  email: "test@example.com",
  username: "test",
  password: "password",
};

const WORKSPACE_TITLES = [
  "Personal",
  "Engineering",
  "Product",
  "Design System",
  "Customer Success",
  "Platform Infrastructure",
  "Marketing",
  "Security & Compliance",
  "Research",
  "Operations",
];

/** Placeholder slugs; the real slug is derived from the title once the rows exist. */
const WORKSPACE_SLUG_PLACEHOLDERS = WORKSPACE_TITLES.map((_, index) => `seed-workspace-${index}`);

/** Workspaces that get a thumbnail. */
const WORKSPACES_WITH_IMAGES = new Set(["Engineering", "Product", "Design System", "Marketing", "Research"]);

/** The workspace pinned for the test user. */
const PINNED_WORKSPACE = "Engineering";

const DOCUMENT_TOPICS = [
  "Authentication",
  "Billing",
  "Onboarding",
  "Search",
  "Notifications",
  "Data Retention",
  "Rate Limiting",
  "Mobile App",
  "Design Tokens",
  "Incident Response",
  "Customer Feedback",
  "Release Train",
  "Cost Reporting",
  "Accessibility",
  "Localisation",
  "Observability",
  "Api Versioning",
  "Offline Support",
];

const DOCUMENT_KINDS = [
  "Design Doc",
  "Runbook",
  "Postmortem",
  "Meeting Notes",
  "Roadmap",
  "Retrospective",
  "Research Summary",
  "Migration Plan",
  "Style Guide",
  "Weekly Update",
];

/** Every combination is unique, which keeps the derived slugs unique too. */
const DOCUMENT_TITLES = DOCUMENT_TOPICS.flatMap((topic) => DOCUMENT_KINDS.map((kind) => `${topic} ${kind}`));

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const db = drizzle(databaseUrl);
const files = new Files({ adapter: fs({ root: "./.uploads" }) });

// Workspaces (and their documents and pins) cascade from the user, so this clears any previous seed.
// Audit logs reference the user without a cascade, so they have to be removed first.
// Previously seeded thumbnails are not cleaned up by the cascade, so remove them here.
const staleImages = await db
  .select({ image: s.workspaces.image })
  .from(s.workspaces)
  .where(and(eq(s.workspaces.ownerId, TEST_USER.id), isNotNull(s.workspaces.image)));

for (const { image } of staleImages) {
  if (image && (await files.exists(image))) await files.delete(image);
}

await db.delete(s.workspaces).where(eq(s.workspaces.ownerId, TEST_USER.id));
await db.delete(s.auditLogs).where(eq(s.auditLogs.actorId, TEST_USER.id));
await db.delete(s.users).where(eq(s.users.id, TEST_USER.id));

const now = new Date();

await db.insert(s.users).values({
  id: TEST_USER.id,
  name: TEST_USER.name,
  email: TEST_USER.email,
  username: TEST_USER.username,
  displayUsername: TEST_USER.username,
  createdAt: now,
  updatedAt: now,
});

await db.insert(s.accounts).values({
  id: `${TEST_USER.id}-credential`,
  accountId: TEST_USER.id,
  providerId: "credential",
  userId: TEST_USER.id,
  password: await hashPassword(TEST_USER.password),
  createdAt: now,
  updatedAt: now,
});

// Slugs are derived from the generated titles afterwards, so they start out as a
// placeholder that still satisfies the slug check constraints.
await seed(db, { workspaces: s.workspaces, documents: s.documents }).refine((f) => ({
  workspaces: {
    count: WORKSPACE_TITLES.length,
    columns: {
      title: f.valuesFromArray({ values: WORKSPACE_TITLES, isUnique: true }),
      slug: f.valuesFromArray({ values: WORKSPACE_SLUG_PLACEHOLDERS, isUnique: true }),
      description: f.loremIpsum({ sentencesCount: 2 }),
      image: f.default({ defaultValue: null }),
      ownerId: f.default({ defaultValue: TEST_USER.id }),
      createdAt: f.date({ minDate: "2025-01-01", maxDate: "2025-09-01" }),
      updatedAt: f.date({ minDate: "2025-09-01", maxDate: "2026-08-01" }),
    },
    with: {
      documents: [
        { weight: 0.3, count: [4, 5, 6] },
        { weight: 0.5, count: [8, 9, 10, 11] },
        { weight: 0.2, count: [14, 16, 18] },
      ],
    },
  },
  documents: {
    columns: {
      title: f.valuesFromArray({ values: DOCUMENT_TITLES, isUnique: true }),
      slug: f.uuid(),
      content: f.loremIpsum({ sentencesCount: 12 }),
      createdAt: f.date({ minDate: "2025-01-01", maxDate: "2025-09-01" }),
      updatedAt: f.date({ minDate: "2025-09-01", maxDate: "2026-08-01" }),
    },
  },
}));

// Derive readable slugs from the generated titles.
await db
  .update(s.workspaces)
  .set({ slug: sql`left(regexp_replace(lower(${s.workspaces.title}), '[^a-z0-9]+', '-', 'g'), 32)` })
  .where(eq(s.workspaces.ownerId, TEST_USER.id));

const workspaces = await db
  .select({ id: s.workspaces.id, title: s.workspaces.title, slug: s.workspaces.slug })
  .from(s.workspaces)
  .where(eq(s.workspaces.ownerId, TEST_USER.id));

const workspaceIds = workspaces.map((workspace) => workspace.id);

await db
  .update(s.documents)
  .set({
    slug: sql`regexp_replace(lower(${s.documents.title}), '[^a-z0-9]+', '-', 'g')`,
    content: sql`'# ' || ${s.documents.title} || E'\n\n' || ${s.documents.content}`,
  })
  .where(inArray(s.documents.workspaceId, workspaceIds));

// Pin one workspace, and one document inside every workspace.
const pinnedWorkspace = workspaces.find((workspace) => workspace.title === PINNED_WORKSPACE);
if (pinnedWorkspace) {
  await db.insert(s.pinnedWorkspaces).values({ workspaceId: pinnedWorkspace.id, userId: TEST_USER.id });
}

for (const workspace of workspaces) {
  const [document] = await db
    .select({ id: s.documents.id })
    .from(s.documents)
    .where(eq(s.documents.workspaceId, workspace.id))
    .orderBy(sql`random()`)
    .limit(1);

  if (document) await db.insert(s.pinnedDocuments).values({ documentId: document.id, userId: TEST_USER.id });
}

// Thumbnails for a subset of the workspaces. Stored through the same file adapter
// the app uses in development, so the workspace image route can serve them.
for (const workspace of workspaces) {
  if (!WORKSPACES_WITH_IMAGES.has(workspace.title)) continue;

  try {
    const response = await fetch(`https://picsum.photos/seed/${workspace.slug}/1200/675`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

    const image = new File([await response.arrayBuffer()], "image.jpg", { type: "image/jpeg" });
    const uploaded = await files.upload(`workspaces/${workspace.id}/image.jpg`, image);

    await db.update(s.workspaces).set({ image: uploaded.key }).where(eq(s.workspaces.id, workspace.id));
  } catch (error) {
    console.warn(`Skipped image for ${workspace.title}:`, error instanceof Error ? error.message : error);
  }
}

// A plausible slice of account history: signup, a few logins, and the workspace and
// document changes that would have produced the rows above.
const SEED_IP = "203.0.113.42";
const SEED_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const auditDocuments = await db
  .select({
    id: s.documents.id,
    workspaceId: s.documents.workspaceId,
    title: s.documents.title,
    slug: s.documents.slug,
  })
  .from(s.documents)
  .where(inArray(s.documents.workspaceId, workspaceIds))
  .orderBy(sql`random()`)
  .limit(6);

const auditEvents: s.AuditLogInsert[] = (
  [
    { action: "user.signup.email", createdAt: new Date("2025-01-04T09:12:00Z") },
    { action: "user.login.email", createdAt: new Date("2025-01-04T09:13:10Z") },
    { action: "user.passkey.added", createdAt: new Date("2025-02-18T15:41:00Z") },
    { action: "user.login.passkey", createdAt: new Date("2025-06-11T08:02:30Z") },
    { action: "user.login.username", status: "failure", createdAt: new Date("2025-06-11T08:01:55Z") },
    { action: "user.login.passkey", createdAt: new Date("2026-08-03T07:55:12Z") },

    // A workspace that no longer exists, so it keeps a null workspace reference.
    {
      action: "workspace.deleted",
      createdAt: new Date("2025-07-22T13:30:00Z"),
      metadata: { title: "Scratchpad", slug: "scratchpad" },
    },

    ...workspaces.map((workspace, index) => ({
      action: "workspace.created" as const,
      workspaceId: workspace.id,
      createdAt: new Date(Date.UTC(2025, index, 6, 10, 15)),
      metadata: { title: workspace.title, slug: workspace.slug, hasImage: false },
    })),

    ...auditDocuments.map((document, index) => ({
      action: "document.created" as const,
      workspaceId: document.workspaceId,
      documentId: document.id,
      createdAt: new Date(Date.UTC(2026, index, 12, 16, 40)),
      metadata: { title: document.title, slug: document.slug },
    })),

    ...auditDocuments.slice(0, 2).map((document, index) => ({
      action: "document.updated" as const,
      workspaceId: document.workspaceId,
      documentId: document.id,
      createdAt: new Date(Date.UTC(2026, 6, 20 + index, 11, 5)),
      metadata: { title: document.title, slug: document.slug },
    })),
  ] satisfies Partial<s.AuditLogInsert>[]
).map((event) => ({
  status: "success" as const,
  actorId: TEST_USER.id,
  actorType: "user" as const,
  ipAddress: SEED_IP,
  userAgent: SEED_USER_AGENT,
  ...event,
}));

if (pinnedWorkspace) {
  auditEvents.push({
    action: "workspace.updated",
    status: "success",
    actorId: TEST_USER.id,
    actorType: "user",
    ipAddress: SEED_IP,
    userAgent: SEED_USER_AGENT,
    workspaceId: pinnedWorkspace.id,
    createdAt: new Date("2026-08-05T12:00:00Z"),
    metadata: { title: pinnedWorkspace.title, slug: pinnedWorkspace.slug, changed: ["description", "image"] },
  });
}

await db.insert(s.auditLogs).values(auditEvents);

const [{ count: documentCount } = { count: 0 }] = await db
  .select({ count: sql<number>`count(*)::int` })
  .from(s.documents)
  .where(inArray(s.documents.workspaceId, workspaceIds));

console.log(
  `Seeded ${TEST_USER.email} / ${TEST_USER.password} with ${workspaces.length} workspaces, ${documentCount} documents and ${auditEvents.length} audit events`,
);
