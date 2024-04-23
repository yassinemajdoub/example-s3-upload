// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import S3 from "aws-sdk/clients/s3";
import { randomUUID } from "crypto";

const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: process.env.ACCESS_KEY, // Access the ACCESS_KEY environment variable
  secretAccessKey: process.env.SECRET_KEY, // Access the SECRET_KEY environment variable
  region: process.env.REGION, // Access the REGION environment variable
  endpoint: process.env.ENDPOINT, // Use your Contabo endpoint
  s3ForcePathStyle: true, // This is often required for custom endpoints
  signatureVersion: "v4",
 });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const fileType = (req.query.fileType as string).split("/")[1];
  const fileName = req.query.fileName as string;

  const Key = `media/${fileName}-${randomUUID()}.${fileType}`;

  const s3Params = {
    Bucket: process.env.BUCKET_NAME,
    Key,
    Expires: 60,
    ContentType: `image/${fileType}`,
  };

  const uploadUrl = await s3.getSignedUrl("putObject", s3Params);

  res.status(200).json({
    uploadUrl,
    key: Key,
  });
}
