CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuidv7 (),
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);

CREATE INDEX sessions_token_hash_idx ON sessions (token_hash);

-- used for cleanup of expired sessions
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);
