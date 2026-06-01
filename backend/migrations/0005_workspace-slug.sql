ALTER TABLE workspaces
ADD slug text NOT NULL;

CREATE UNIQUE INDEX ON workspaces (author_id, slug);
