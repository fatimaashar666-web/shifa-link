
import "server-only";

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  s3Client,
  STORAGE_BUCKET,
  MAX_FILE_SIZE,
} from "./s3-client";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type MedicalFileType =
  (typeof ALLOWED_TYPES)[number];

export async function uploadMedicalDocument(params: {
  key: string;
  buffer: Buffer;
  contentType: MedicalFileType;
}) {
  const { key, buffer, contentType } = params;

  if (!buffer.length || buffer.length > MAX_FILE_SIZE) {
    throw new Error("Invalid file size.");
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return { key };
}

export async function generateMedicalDocumentDownloadUrl(
  key: string
) {
  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
    ResponseContentDisposition: "attachment",
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 60,
  });
}

export async function deleteMedicalDocument(key: string) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
  }));
}
