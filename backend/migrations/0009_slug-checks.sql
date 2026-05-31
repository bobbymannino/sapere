ALTER TABLE workspaces
ADD CONSTRAINT slug_check CHECK (slug ~ '^[a-zA-Z0-9 _:\s-]+$');

ALTER TABLE projects
ADD CONSTRAINT slug_check CHECK (slug ~ '^[a-zA-Z0-9 _:\s-]+$');
