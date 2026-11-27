import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Bucket, getR2Client } from "./r2";
import { PENDING_PREFIX } from "./uploads";

/** Max SigV4 expiry for IAM-style credentials */
export const DOWNLOAD_URL_EXPIRES_IN = 7 * 24 * 60 * 60;

export type ObjectHead = {
  contentLength: number;
  contentType: string | undefined;
};

function encodeCopySource(bucket: string, key: string) {
  return `${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function headObject(storageKey: string): Promise<ObjectHead | null> {
  try {
    const result = await getR2Client().send(
      new HeadObjectCommand({
        Bucket: getR2Bucket(),
        Key: storageKey,
      }),
    );
    return {
      contentLength: result.ContentLength ?? 0,
      contentType: result.ContentType,
    };
  } catch {
    return null;
  }
}

export async function copyObject(fromKey: string, toKey: string) {
  const bucket = getR2Bucket();
  await getR2Client().send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: encodeCopySource(bucket, fromKey),
      Key: toKey,
      MetadataDirective: "COPY",
    }),
  );
}

export async function deleteObject(storageKey: string) {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2Bucket(),
      Key: storageKey,
    }),
  );
}

export async function listPendingObjects() {
  const client = getR2Client();
  const bucket = getR2Bucket();
  const objects: { key: string; lastModified: Date | undefined; size: number }[] =
    [];
  let token: string | undefined;

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: PENDING_PREFIX,
        ContinuationToken: token,
      }),
    );
    for (const item of page.Contents ?? []) {
      if (!item.Key) continue;
      objects.push({
        key: item.Key,
        lastModified: item.LastModified,
        size: item.Size ?? 0,
      });
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);

  return objects;
}

export async function getSignedDownloadUrl(storageKey: string): Promise<string> {
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: storageKey,
    }),
    { expiresIn: DOWNLOAD_URL_EXPIRES_IN },
  );
}
