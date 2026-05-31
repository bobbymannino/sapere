ALTER TABLE workspaces
RENAME author_id TO owner_id;

ALTER TABLE workspaces
ADD author_id int NOT NULL REFERENCES users (id);
