function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function getR2Env() {
  return {
    accountId: required("R2_ACCOUNT_ID"),
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    bucketName: required("R2_BUCKET_NAME"),
    endpoint:
      process.env.R2_ENDPOINT ??
      `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  };
}

const SIMPLE_EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function getResendEnv() {
  const apiKey = required("RESEND_API_KEY");
  const notifyEmail = required("NOTIFY_EMAIL").trim();
  const emailFrom = required("EMAIL_FROM").trim();

  if (!SIMPLE_EMAIL_RE.test(notifyEmail)) {
    throw new Error("NOTIFY_EMAIL must be a plain address like name@example.com");
  }
  if (!SIMPLE_EMAIL_RE.test(emailFrom)) {
    throw new Error(
      "EMAIL_FROM must be a plain address like hello@example.com (no quotes/backticks)",
    );
  }

  return {
    apiKey,
    notifyEmail,
    emailFrom,
  };
}
