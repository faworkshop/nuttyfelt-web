/**
 * Delete abandoned R2 objects under commissions/pending/ older than 48 hours.
 * Submitted files are promoted off this prefix on form submit.
 *
 * Usage: npm run r2:cleanup-pending
 * Dry run:  npm run r2:cleanup-pending -- --dry-run
 */
import { config } from "dotenv";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

config({ path: ".env.local" });

const PENDING_PREFIX = "commissions/pending/";
const PENDING_MAX_AGE_MS = 48 * 60 * 60 * 1000;
const dryRun = process.argv.includes("--dry-run");

const endpoint =
  process.env.R2_ENDPOINT ||
  `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const bucket = process.env.R2_BUCKET_NAME;
const cutoff = Date.now() - PENDING_MAX_AGE_MS;
let listed = 0;
let deleted = 0;
let token;

do {
  const page = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: PENDING_PREFIX,
      ContinuationToken: token,
    }),
  );

  for (const item of page.Contents ?? []) {
    listed += 1;
    if (!item.Key || !item.LastModified) continue;
    if (item.LastModified.getTime() > cutoff) continue;

    if (dryRun) {
      console.log("would_delete", item.Key, item.LastModified.toISOString());
      deleted += 1;
      continue;
    }

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: item.Key,
      }),
    );
    console.log("deleted", item.Key);
    deleted += 1;
  }

  token = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (token);

console.log(
  JSON.stringify(
    {
      dryRun,
      prefix: PENDING_PREFIX,
      maxAgeHours: PENDING_MAX_AGE_MS / (60 * 60 * 1000),
      listed,
      deleted,
    },
    null,
    2,
  ),
);
