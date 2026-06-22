import { Files } from "files-sdk";
import { compression } from "files-sdk/compression";
import { fs } from "files-sdk/fs";

export const files = new Files({
  adapter: fs({ root: "./.uploads" }),
  plugins: [compression()],
});
