/**
 * Seeds the database with a single test user owning three workspaces,
 * each containing three documents. Safe to re-run: existing seed rows are removed first.
 */
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql/postgres";

import * as s from "../src/lib/server/db/schema.ts";

const TEST_USER = {
  id: "seed-user-test",
  name: "Test User",
  email: "test@example.com",
  username: "test",
  password: "password",
};

const WORKSPACES = [
  {
    title: "Personal",
    slug: "personal",
    description: "Notes and ideas that do not belong anywhere else.",
    documents: [
      { title: "Reading List", slug: "reading-list" },
      { title: "Weekly Review", slug: "weekly-review" },
      { title: "Trip Planning", slug: "trip-planning" },
    ],
  },
  {
    title: "Engineering",
    slug: "engineering",
    description: "Design docs, runbooks and architecture notes.",
    documents: [
      { title: "Architecture Overview", slug: "architecture-overview" },
      { title: "Deployment Runbook", slug: "deployment-runbook" },
      { title: "Incident Postmortem", slug: "incident-postmortem" },
    ],
  },
  {
    title: "Product",
    slug: "product",
    description: "Roadmap, research and release planning.",
    documents: [
      { title: "Roadmap 2026", slug: "roadmap-2026" },
      { title: "User Research", slug: "user-research" },
      { title: "Release Notes", slug: "release-notes" },
    ],
  },
];

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const db = drizzle(databaseUrl);

// Workspaces (and their documents) cascade from the user, so this clears any previous seed.
await db.delete(s.workspaces).where(eq(s.workspaces.ownerId, TEST_USER.id));
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

for (const workspace of WORKSPACES) {
  const [inserted] = await db
    .insert(s.workspaces)
    .values({
      title: workspace.title,
      slug: workspace.slug,
      description: workspace.description,
      ownerId: TEST_USER.id,
    })
    .returning({ id: s.workspaces.id });

  await db.insert(s.documents).values(
    workspace.documents.map((document) => ({
      workspaceId: inserted!.id,
      title: document.title,
      slug: document.slug,
      content: `# ${document.title}\n\nSeeded content for **${document.title}** in ${workspace.title}.`,
    })),
  );
}

console.log(`Seeded ${TEST_USER.email} / ${TEST_USER.password} with ${WORKSPACES.length} workspaces`);
