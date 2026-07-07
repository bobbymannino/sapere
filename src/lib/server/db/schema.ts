import { SQL, sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import { pgTable, text, timestamp, boolean, integer, index, check, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  username: text("username").notNull().unique(),
  displayUsername: text("display_username"),
  lastLoginMethod: text("last_login_method"),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const passkeys = pgTable(
  "passkeys",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at"),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkeys_user_id_idx").on(table.userId),
    index("passkeys_credential_id_idx").on(table.credentialID),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  passkeys: many(passkeys),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const passkeysRelations = relations(passkeys, ({ one }) => ({
  users: one(users, {
    fields: [passkeys.userId],
    references: [users.id],
  }),
}));

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid()
      .primaryKey()
      .default(sql`uuidv7()`),

    title: text().notNull(),
    orderableTitle: text("orderable_title").generatedAlwaysAs(
      (): SQL => sql`regexp_replace(lower(${workspaces.title}), '[^a-z0-9]', '', 'g')`,
    ),
    slug: text().notNull(),
    description: text(),
    image: text(),

    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [
    uniqueIndex("workspaces_owner_slug_unique").on(t.ownerId, t.slug),
    index("workspaces_owner_created_at_idx").on(t.ownerId, t.createdAt),
    index("workspaces_owner_updated_at_idx").on(t.ownerId, t.updatedAt),
    index("workspaces_owner_orderable_title_idx").on(t.ownerId, t.orderableTitle),
    index("workspaces_owner_title_idx").on(t.ownerId, t.title),
    check(`chk_workspaces_title_length`, sql`char_length(${t.title}) >= 3 and char_length(${t.title}) <= 64`),
    check(`chk_workspaces_slug_length`, sql`char_length(${t.slug}) >= 3 and char_length(${t.slug}) <= 32`),
    check(`chk_workspaces_description_length`, sql`char_length(${t.description}) <= 1000`),
    check(`chk_workspaces_slug_valid`, sql`${t.slug} ~ '^[a-z0-9_\.-]+$'`),
  ],
);

export type WorkspaceSelect = typeof workspaces.$inferSelect;
export type WorkspaceInsert = typeof workspaces.$inferInsert;

export const pinnedWorkspaces = pgTable(
  "pinned_workspaces",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pinnedAt: timestamp("pinned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pinned_workspaces_workspace_id_user_id_idx").on(t.workspaceId, t.userId),
    index("pinned_workspaces_user_id_idx").on(t.userId),
  ],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid()
      .primaryKey()
      .default(sql`uuidv7()`),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    title: text().notNull(),
    orderableTitle: text("orderable_title").generatedAlwaysAs(
      (): SQL => sql`regexp_replace(lower(${documents.title}), '[^a-z0-9]', '', 'g')`,
    ),
    slug: text().notNull(),
    content: text()
      .notNull()
      .default(sql`''`)
      .$defaultFn((): SQL => sql`'# ' || ${documents.title}`),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [
    uniqueIndex("workspaces_workspace_slug_unique").on(t.workspaceId, t.slug),
    index("workspaces_workspace_created_at_idx").on(t.workspaceId, t.createdAt),
    index("workspaces_workspace_updated_at_idx").on(t.workspaceId, t.updatedAt),
    index("workspaces_workspace_orderable_title_idx").on(t.workspaceId, t.orderableTitle),
    index("workspaces_workspace_title_idx").on(t.workspaceId, t.title),
    check(`chk_documents_title_length`, sql`char_length(${t.title}) >= 3 and char_length(${t.title}) <= 64`),
    check(`chk_documents_slug_length`, sql`char_length(${t.slug}) >= 3 and char_length(${t.slug}) <= 32`),
    check(`chk_documents_slug_valid`, sql`${t.slug} ~ '^[a-z0-9_\.-]+$'`),
  ],
);

export type DocumentSelect = typeof documents.$inferSelect;
export type DocumentInsert = typeof documents.$inferInsert;

export const pinnedDocuments = pgTable(
  "pinned_documents",
  {
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pinnedAt: timestamp("pinned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pinned_documents_document_id_user_id_idx").on(t.documentId, t.userId),
    index("pinned_documents_user_id_idx").on(t.userId),
  ],
);
