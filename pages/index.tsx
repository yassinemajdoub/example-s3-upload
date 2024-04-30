import axios from "axios";
import { ChangeEvent } from "react";
import Image from 'next/image';
import { useState } from 'react';


function Upload() {
  const [uploadedImageKey, setUploadedImageKey] = useState(null);
  const [isUploading, setIsUploading] = useState(false); 

  async function uploadToS3(e) {
    setIsUploading(true); 
    console.log('Starting upload...');

    const formData = new FormData(e.target);

    const file = formData.get('file');

    if (!file) {
      setIsUploading(false);
      console.log('No file provided.');
      return null;
    }

    const fileType = encodeURIComponent(file.type);
    const fileName = file.name;

    console.log('Fetching signed URL...');
    const { data } = await axios.get(`/api/media?fileType=${fileType}&fileName=${fileName}`);

    const { uploadUrl, key } = data;

    console.log('Uploading to S3...');
    await axios.put(uploadUrl, file);

    setUploadedImageKey(key); 
    setIsUploading(false); 

    console.log('Upload completed. Image key:', key);
  }

  async function handleDelete() {
    if (uploadedImageKey) {
      console.log('Deleting image with key:', uploadedImageKey);
      const { data } = await axios.delete(`/api/deleteImage?key=${encodeURIComponent(uploadedImageKey)}`);

      console.log(data);

      setUploadedImageKey(null); // Clear the key after deletion
      console.log('Image deleted.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await uploadToS3(e);
  }

  return (
    <>
      <p>Please select file to upload</p>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/jpeg,image/png" name="file" />
        <button type="submit">Upload</button>
      </form>

      {isUploading ? ( 
        <p>Uploading...</p>
      ) : (
        <>
          {uploadedImageKey && (
            <div>
              <p>Uploaded Image:</p>
              <Image
                src={`https://eu2.contabostorage.com/${uploadedImageKey}`}
                alt="Uploaded Image"
                width={500}
                height={300}
              />
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Upload;

