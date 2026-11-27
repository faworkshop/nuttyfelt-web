import { config } from "dotenv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

config({ path: ".env.local" });

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

const body = Buffer.from("fakepayload!!");
const session = randomUUID();
const key = `commissions/pending/${session}/basic/${randomUUID()}-smoke.jpg`;

const uploadUrl = await getSignedUrl(
  client,
  new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: "image/jpeg",
    ContentLength: body.length,
  }),
  {
    expiresIn: 900,
    signableHeaders: new Set(["content-type"]),
  },
);

const put = await fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "image/jpeg",
  },
  body,
});

console.log(
  JSON.stringify(
    {
      key,
      signed: uploadUrl.includes("X-Amz-Signature"),
      signedHeaders: new URL(uploadUrl).searchParams.get("X-Amz-SignedHeaders"),
      putStatus: put.status,
      putOk: put.ok,
    },
    null,
    2,
  ),
);

if (!put.ok) {
  console.error(await put.text());
  process.exit(1);
}
