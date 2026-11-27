import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

config({ path: ".env.local" });

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const endpoint =
  process.env.R2_ENDPOINT ||
  `https://${accountId}.r2.cloudflarestorage.com`;

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  console.error("Missing R2 env vars in .env.local");
  process.exit(1);
}

const cors = JSON.parse(readFileSync(new URL("./r2-cors.json", import.meta.url), "utf8"));

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: { CORSRules: cors },
  }),
);

console.log(`CORS applied to bucket ${bucket}`);
console.log("Add your production origin to scripts/r2-cors.json before launch.");
