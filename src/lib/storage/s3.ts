
import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

const requiredVariables = [
  "STORAGE_ENDPOINT",
  "STORAGE_BUCKET_NAME",
  "STORAGE_ACCESS_KEY_ID",
  "STORAGE_SECRET_ACCESS_KEY",
  "STORAGE_REGION",
] as const;

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
}

export const STORAGE_BUCKET =
  process.env.STORAGE_BUCKET_NAME!;

export const MAX_FILE_SIZE = Number(
  process.env.STORAGE_MAX_FILE_SIZE_BYTES || 52428800
);

const urlStyle = process.env.STORAGE_URL_STYLE || "virtual";

if (!["virtual", "path"].includes(urlStyle)) {
  throw new Error("Invalid STORAGE_URL_STYLE");
}

export const s3Client = new S3Client({
  region: process.env.STORAGE_REGION,

  endpoint: process.env.STORAGE_ENDPOINT,

  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },

  forcePathStyle: urlStyle === "path",
});
