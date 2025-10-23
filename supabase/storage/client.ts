export function getPublicImageUrl(path: string) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${SUPABASE_URL}/storage/v1/object/public/farm-house/${path}`;
}

export function normalizeImageUrl(imageValue: string | null): string | null {
  if (!imageValue) return null;
  if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
    return imageValue;
  }
  return getPublicImageUrl(imageValue);
}
import { createSupabaseClient } from "../client";
import { v4 as uuidv4 } from "uuid";

function getStorage() {
  const { storage } = createSupabaseClient();
  return storage;
}

type UploadProps = {
  file: File;
  bucket: string;
  folder?: string;
};

export const uploadImage = async ({ file, bucket, folder }: UploadProps) => {
  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf(".") + 1);
  const path = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  const storage = getStorage();

  const { data, error } = await storage.from(bucket).upload(path, file);

  if (error) {
    return { imageUrl: "", imagePath: "", error: "Image upload failed" };
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${data?.path}`;
  const imagePath = data?.path || "";
  
  console.log("Image uploaded successfully:", imageUrl);

  return { imageUrl, imagePath, error: "" };
};

export const deleteImage = async (imageUrl: string) => {
  const bucketAndPathString = imageUrl.split("/storage/v1/object/public/")[1];
  const firstSlashIndex = bucketAndPathString.indexOf("/");

  const bucket = bucketAndPathString.slice(0, firstSlashIndex);
  const path = bucketAndPathString.slice(firstSlashIndex + 1);

  const storage = getStorage();

  const { data, error } = await storage.from(bucket).remove([path]);

  return { data, error };
};