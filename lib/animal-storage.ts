import { uploadImage, deleteImage } from "@/supabase/storage/client";

export async function uploadAnimalImage(file: File): Promise<{ imageUrl: string; error: string }> {
  return await uploadImage({
    file,
    bucket: "farm-house",
    folder: "animals"
  });
}

export async function deleteAnimalImage(imageUrl: string): Promise<{ error: string | null }> {
  try {
    await deleteImage(imageUrl);
    return { error: null };
  } catch (error) {
    return { error: "Failed to delete image" };
  }
}
