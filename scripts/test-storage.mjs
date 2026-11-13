
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { randomUUID } from "node:crypto";

const required = [
  "STORAGE_ENDPOINT",
  "STORAGE_BUCKET_NAME",
  "STORAGE_ACCESS_KEY_ID",
  "STORAGE_SECRET_ACCESS_KEY",
  "STORAGE_REGION",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing ${key}`);
  }
}

const client = new S3Client({
  region: process.env.STORAGE_REGION,
  endpoint: process.env.STORAGE_ENDPOINT,

  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  },

  forcePathStyle:
    process.env.STORAGE_URL_STYLE === "path",
});

const bucket = process.env.STORAGE_BUCKET_NAME;
const key = `connection-tests/${randomUUID()}.txt`;

try {
  // Upload a temporary test object
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: "ShifaLink Railway storage test",
      ContentType: "text/plain",
    })
  );

  console.log("SUCCESS: File uploaded.");

  // Download the test object
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  const content = await response.Body.transformToString();

  if (content !== "ShifaLink Railway storage test") {
    throw new Error("Downloaded content does not match.");
  }

  console.log("SUCCESS: File downloaded and verified.");

  // Delete the temporary object
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  console.log("SUCCESS: Test file deleted.");
  console.log("Railway storage connection verified!");

} catch (error) {
  console.error("Storage test failed:", error);
  process.exitCode = 1;

} finally {
  client.destroy();
}
