// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import S3 from "aws-sdk/clients/s3";

const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: process.env.ACCESS_KEY, // Your ACCESS_KEY environment variable
  secretAccessKey: process.env.SECRET_KEY, // Your SECRET_KEY environment variable
  region: process.env.REGION, // Your REGION environment variable
  endpoint: process.env.ENDPOINT, // Your Contabo endpoint
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { key } = req.query;

  if (!key) {
    res.status(400).json({ error: "Key is required to delete an object" });
    return;
  }

  const s3Params = {
    Bucket: process.env.BUCKET_NAME, // Your S3 bucket name
    Key: key, // The key of the image to delete
  };

  try {
    await s3.deleteObject(s3Params).promise();
    res.status(200).json({ success: true, message: "Object deleted" });
  } catch (error) {
    res.status(500).json({ error: `Error deleting object: ${error.message}` });
  }
}
