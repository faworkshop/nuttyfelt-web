import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Bucket, getR2Client } from "./r2";

/** Max SigV4 expiry for IAM-style credentials */
export const DOWNLOAD_URL_EXPIRES_IN = 7 * 24 * 60 * 60;

export type ObjectHead = {
  contentLength: number;
  contentType: string | undefined;
};

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
