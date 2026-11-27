import { S3Client } from "@aws-sdk/client-s3";
import { getR2Env } from "./env";

let client: S3Client | null = null;

export function getR2Client() {
  if (client) return client;

  const env = getR2Env();
  client = new S3Client({
    region: "auto",
    endpoint: env.endpoint,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
    // Presigned PUTs break if the SDK injects optional checksum query params.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

export function getR2Bucket() {
  return getR2Env().bucketName;
}
