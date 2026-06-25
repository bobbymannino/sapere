import { dev } from "$app/env";
import { MINIO_ACCESS_KEY_ID, MINIO_ENDPOINT_URL, MINIO_SECRET_ACCESS_KEY } from "$app/env/private";
import { Files } from "files-sdk";
import { fs } from "files-sdk/fs";
import { minio } from "files-sdk/minio";

export const files = new Files({
  adapter: dev
    ? fs({ root: "./.uploads" })
    : minio({
        bucket: "uploads",
        endpoint: MINIO_ENDPOINT_URL ?? "",
        accessKeyId: MINIO_ACCESS_KEY_ID,
        secretAccessKey: MINIO_SECRET_ACCESS_KEY,
      }),
});

/**
 * Deletes a file if it exists. Any errors are silenced.
 *
 * @param key The key of the file to delete.
 */
export async function deleteFileIfExists(key: string) {
  try {
    if (await files.exists(key)) await files.delete(key);
  } catch {}
}

/**
 * Return the extension for a given mime type. If no extension is known,
 * returns `bin`.
 *
 * @param type The mime type of the file.
 */
export function fileTypeToExtension(type: string) {
  switch (type) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}
