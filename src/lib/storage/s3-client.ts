
import "server-only";

import {
  S3Client,
} from "@aws-sdk/client-s3";

function getStorageConfig() {
  const {
    STORAGE_ENDPOINT,
    STORAGE_BUCKET_NAME,
    STORAGE_ACCESS_KEY_ID,
    STORAGE_SECRET_ACCESS_KEY,
    STORAGE_REGION,
    STORAGE_URL_STYLE,
  } = process.env;

  const required = {
    STORAGE_ENDPOINT,
    STORAGE_BUCKET_NAME,
    STORAGE_ACCESS_KEY_ID,
    STORAGE_SECRET_ACCESS_KEY,
    STORAGE_REGION,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing storage environment variables: ${missing.join(", ")}`
    );
  }

  if (!["virtual", "path"].includes(STORAGE_URL_STYLE ?? "")) {
    throw new Error(
      "STORAGE_URL_STYLE must be either virtual or path"
    );
  }

  const endpoint = new URL(STORAGE_ENDPOINT!);

  if (endpoint.protocol !== "https:") {
    throw new Error("Storage endpoint must use HTTPS");
  }

  return {
    endpoint: endpoint.toString(),
    bucket: STORAGE_BUCKET_NAME!,
    region: STORAGE_REGION!,
    accessKeyId: STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: STORAGE_SECRET_ACCESS_KEY!,
    forcePathStyle: STORAGE_URL_STYLE === "path",
  };
}

const config = getStorageConfig();

export const storageBucket = config.bucket;

export const s3Client = new S3Client({
  region: config.region,
  endpoint: config.endpoint,
  forcePathStyle: config.forcePathStyle,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});
