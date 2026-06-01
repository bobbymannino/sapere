CREATE TABLE workspace_members (
  workspace_id INT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member', 'guest')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX ON workspace_members (user_id);
