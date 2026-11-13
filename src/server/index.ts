import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.STORAGE_BUCKET_NAME!;

const s3 = new S3Client({
  region: process.env.STORAGE_REGION || "auto",
  endpoint: process.env.STORAGE_ENDPOINT,
  forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
});

export async function createPresignedUploadUrl(params: {
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.storageKey,
    ContentType: params.mimeType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 15 * 60,
  });

  return {
    uploadUrl,
    storageKey: params.storageKey,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}

export async function createPresignedDownloadUrl(storageKey: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: storageKey,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 10 * 60,
  });
}