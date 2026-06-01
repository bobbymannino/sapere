CREATE TABLE projects (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (title ~ '^[a-zA-Z0-9 _:-]+$'),
  slug text NOT NULL,
  description text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id INT NOT NULL REFERENCES users (id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, slug)
);

CREATE INDEX ON projects (workspace_id, created_at);

CREATE INDEX ON projects (workspace_id, updated_at);

CREATE UNIQUE INDEX ON projects (workspace_id, title);
