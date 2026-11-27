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

export function getResendEnv() {
  return {
    apiKey: required("RESEND_API_KEY"),
    notifyEmail: required("NOTIFY_EMAIL"),
    emailFrom: required("EMAIL_FROM"),
  };
}
