import { uploadImage, deleteImage } from "@/supabase/storage/client";

export async function uploadUserImage(file: File): Promise<{ imageUrl: string; imagePath: string; error: string }> {
  return await uploadImage({
    file,
    bucket: "farm-house",
    folder: "users"
  });
}

export async function deleteUserImage(imageUrl: string): Promise<{ error: string | null }> {
  try {
    await deleteImage(imageUrl);
    return { error: null };
  } catch (error) {
    return { error: "Failed to delete image" };
  }
}
