import { dev } from "$app/env";
import { S3_ACCESS_KEY_ID, S3_ENDPOINT_URL, S3_SECRET_ACCESS_KEY } from "$app/env/private";
import { Files } from "files-sdk";
import { bunS3 } from "files-sdk/bun-s3";
import { compression } from "files-sdk/compression";
import { fs } from "files-sdk/fs";

export const files = new Files({
  adapter: dev
    ? fs({ root: "./.uploads" })
    : bunS3({
        bucket: "uploads",
        endpoint: S3_ENDPOINT_URL,
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      }),
  plugins: [compression()],
});
