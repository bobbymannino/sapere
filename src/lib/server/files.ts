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
