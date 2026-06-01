ALTER TABLE workspaces
ADD CONSTRAINT slug_check CHECK (slug ~ '^[a-z0-9-]+$');

ALTER TABLE projects
ADD CONSTRAINT slug_check CHECK (slug ~ '^[a-z0-9-]+$');
