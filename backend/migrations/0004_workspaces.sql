CREATE TABLE workspaces (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL CHECK (title ~ '^[a-zA-Z0-9 _:-]+$'),
  description text CHECK (LENGTH(description) <= 1000),
  author_id int NOT NULL REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ON workspaces (author_id, title);

CREATE INDEX ON workspaces (author_id, created_at);

CREATE INDEX ON workspaces (author_id, updated_at);
