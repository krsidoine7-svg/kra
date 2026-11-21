import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function getS3Client(): S3Client {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const region = process.env.AWS_REGION ?? "eu-central-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Variables Neon Object Storage manquantes (AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)."
    );
  }

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getBucketName(): string {
  return process.env.NEON_STORAGE_BUCKET ?? "portfolio-public";
}

export function buildPublicMediaUrl(objectKey: string): string {
  if (!objectKey) return "";
  if (objectKey.startsWith("http://") || objectKey.startsWith("https://")) {
    return objectKey;
  }
  const cdnBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, "");
  if (cdnBase) {
    return `${cdnBase}/${objectKey}`;
  }
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/$/, "") ?? "";
  return `${endpoint}/${getBucketName()}/${objectKey}`;
}

export async function uploadObjectToNeon(params: {
  objectKey: string;
  body: Buffer;
  contentType: string;
  immutable?: boolean;
}): Promise<void> {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: params.objectKey,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl:
        params.immutable !== false
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
    })
  );
}

export async function deleteObjectFromNeon(objectKey: string): Promise<void> {
  if (!objectKey) return;
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: objectKey,
    })
  );
}

