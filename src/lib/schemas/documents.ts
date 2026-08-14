import * as v from "valibot";

export const DocumentIdSchema = v.pipe(v.string(), v.trim(), v.uuid());

export const DocumentTitleSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Please enter a document title"),
  v.minLength(3, "Document title must be at least 3 characters long"),
  v.maxLength(64, "Document title must be at most 64 characters long"),
);

const reservedSlugs = ["new", "edit", "delete"];

export const DocumentSlugSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Please enter a document slug"),
  v.minLength(3, "Document slug must be at least 3 characters long"),
  v.maxLength(64, "Document slug must be at most 64 characters long"),
  v.regex(
    /^[a-z0-9_.-]+$/,
    "Document slug must only contain lowercase letters, numbers, underscores, dots and hyphens",
  ),
  v.check(
    (slug) => !reservedSlugs.includes(slug),
    `Document slug cannot be one of the reserved slugs: ${reservedSlugs.join(", ")}`,
  ),
);

export const DocumentContentSchema = v.pipe(
  v.string("Document content must be a string"),
  v.maxLength(200000, "Document content must be at most 200,000 characters long"),
);
