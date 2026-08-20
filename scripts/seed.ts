/**
 * Seeds the database with a single test user owning a handful of workspaces,
 * each containing a varying number of documents. Titles, descriptions, content
 * and quantities all come from `faker`, seeded with a fixed value so re-running
 * the script produces the same data.
 *
 * Safe to re-run: existing seed rows are removed first.
 */
import { faker } from "@faker-js/faker";
import { hashPassword } from "better-auth/crypto";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql/postgres";
import { Files } from "files-sdk";
import { fs } from "files-sdk/fs";

import * as s from "../src/lib/server/db/schema.ts";

faker.seed(20260820);

const TEST_USER = {
  id: "seed-user-test",
  name: "Test User",
  email: "test@example.com",
  username: "test",
  password: "password",
};

const WORKSPACE_COUNT = faker.number.int({ min: 13, max: 20 });

function slugify(value: string, maxLength: number) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

/** Slugs are unique per owner (workspaces) and per workspace (documents). */
function uniqueSlug(title: string, maxLength: number, taken: Set<string>) {
  const base = slugify(title, maxLength);
  let slug = base;
  for (let suffix = 2; taken.has(slug); suffix++) {
    slug = `${base.slice(0, maxLength - String(suffix).length - 1)}-${suffix}`;
  }
  taken.add(slug);
  return slug;
}

/** Title cased, and kept inside the 3-64 character check constraint. */
function titleCase(words: string) {
  const cased = words.replace(/\b\w/g, (character) => character.toUpperCase());
  return cased.length > 64 ? cased.slice(0, 64).trimEnd() : cased;
}

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

const workspaceSlugs = new Set<string>();

const workspaceValues: s.WorkspaceInsert[] = Array.from({ length: WORKSPACE_COUNT }, () => {
  const title = titleCase(`${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`);
  const createdAt = faker.date.between({ from: "2025-01-01", to: "2025-09-01" });

  return {
    title,
    slug: uniqueSlug(title, 32, workspaceSlugs),
    description: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })).slice(0, 1000),
    ownerId: TEST_USER.id,
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: "2026-08-01" }),
  };
});

const workspaces = await db
  .insert(s.workspaces)
  .values(workspaceValues)
  .returning({ id: s.workspaces.id, title: s.workspaces.title, slug: s.workspaces.slug });

const workspaceIds = workspaces.map((workspace) => workspace.id);

const documentValues: s.DocumentInsert[] = workspaces.flatMap((workspace) => {
  const documentSlugs = new Set<string>();

  return Array.from({ length: faker.number.int({ min: 4, max: 20 }) }, () => {
    const title = titleCase(faker.lorem.words({ min: 2, max: 5 }));
    const createdAt = faker.date.between({ from: "2025-01-01", to: "2025-09-01" });

    return {
      workspaceId: workspace.id,
      title,
      slug: uniqueSlug(title, 64, documentSlugs),
      content: `# ${title}\n\n${faker.lorem.paragraphs(faker.number.int({ min: 2, max: 5 }), "\n\n")}`,
      createdAt,
      updatedAt: faker.date.between({ from: createdAt, to: "2026-08-01" }),
    };
  });
});

await db.insert(s.documents).values(documentValues);

for (const workspaceId of workspaceIds) {
  if (!faker.datatype.boolean()) continue;
  await db.insert(s.pinnedWorkspaces).values({ workspaceId, userId: TEST_USER.id });
}

for (const workspace of workspaces) {
  const documents = await db
    .select({ id: s.documents.id })
    .from(s.documents)
    .where(eq(s.documents.workspaceId, workspace.id))
    .orderBy(sql`random()`)
    .limit(faker.number.int({ min: 0, max: 5 }));

  if (documents.length)
    await db
      .insert(s.pinnedDocuments)
      .values(documents.map((document) => ({ documentId: document.id, userId: TEST_USER.id })));
}

// Thumbnails for a random subset of the workspaces. Stored through the same file adapter
// the app uses in development, so the workspace image route can serve them.
const workspacesWithImages = faker.helpers.arrayElements(workspaces, { min: 3, max: 6 });

for (const workspace of workspacesWithImages) {
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
      createdAt: new Date(Date.UTC(2025, index % 12, 6, 10, 15)),
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

await db.insert(s.auditLogs).values(auditEvents);

console.log(
  `Seeded ${TEST_USER.email} / ${TEST_USER.password} with ${workspaces.length} workspaces, ${documentValues.length} documents and ${auditEvents.length} audit events`,
);
