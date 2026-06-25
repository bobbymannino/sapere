import * as v from "valibot";

export const WorkspaceTitleSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Please enter a workspace title"),
  v.minLength(3, "Workspace title must be at least 3 characters long"),
  v.maxLength(64, "Workspace title must be at most 64 characters long"),
);

export const WorkspaceDescriptionSchema = v.pipe(
  v.string(),
  v.trim(),
  v.maxLength(1000, "Workspace description must be at most 1000 characters long"),
  v.transform((description) => description || null),
);

const reservedSlugs = ["new"];

export const WorkspaceSlugSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Please enter a workspace slug"),
  v.minLength(3, "Workspace slug must be at least 3 characters long"),
  v.maxLength(32, "Workspace slug must be at most 32 characters long"),
  v.regex(
    /^[a-z0-9_.-]+$/,
    "Workspace slug must only contain lowercase letters, numbers, underscores, dots and hyphens",
  ),
  v.check(
    (v) => !reservedSlugs.includes(v),
    `Workspace slug cannot be one of the reserved slugs: ${reservedSlugs.join(", ")}`,
  ),
);

export const WorkspaceImageSchema = v.union([
  v.pipe(
    v.file(),
    v.size(0),
    v.transform(() => null),
  ),
  v.pipe(
    v.file(),
    v.maxSize(1024 * 1024 * 5, "Image must be at most 5MB"),
    v.mimeType(
      ["image/png", "image/jpeg", "image/avif", "image/webp"],
      "Invalid image type. Only PNG, JPEG, AVIF, and WebP are supported.",
    ),
  ),
]);

export const WorkspaceRemoveImageSchema = v.pipe(
  v.picklist(["true", "false"]),
  v.transform((v) => v === "true"),
);
