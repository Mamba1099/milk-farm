import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Storage folder constants
export const STORAGE_FOLDERS = {
  USER_AVATARS: 'user-avatars',
  ANIMAL_IMAGES: 'animal-images'
} as const;

// Upload image to a specific folder
export async function uploadImage(
  file: File,
  folder: string = STORAGE_FOLDERS.USER_AVATARS
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("milk-farm")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("milk-farm")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    return null;
  }
}

// Upload user avatar specifically
export async function uploadUserAvatar(file: File): Promise<string | null> {
  return uploadImage(file, STORAGE_FOLDERS.USER_AVATARS);
}

// Upload animal image specifically
export async function uploadAnimalImage(file: File): Promise<string | null> {
  return uploadImage(file, STORAGE_FOLDERS.ANIMAL_IMAGES);
}

// Delete image from Supabase Storage
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("milk-farm")
      .remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Image delete error:", error);
    return false;
  }
}

// Validate image file
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "Image must be less than 5MB" };
  }

  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Image must be a JPEG, PNG, GIF, or WebP file",
    };
  }

  return { valid: true };
}

// List images in a specific folder
export async function listImages(folder: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from("milk-farm")
      .list(folder, {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error("Error listing images:", error);
      return [];
    }

    // Return public URLs for all images
    return data.map((file) => {
      const { data: publicUrlData } = supabase.storage
        .from("milk-farm")
        .getPublicUrl(`${folder}/${file.name}`);
      return publicUrlData.publicUrl;
    });
  } catch (error) {
    console.error("Error listing images:", error);
    return [];
  }
}

// List user avatars
export async function listUserAvatars(): Promise<string[]> {
  return listImages(STORAGE_FOLDERS.USER_AVATARS);
}

// List animal images
export async function listAnimalImages(): Promise<string[]> {
  return listImages(STORAGE_FOLDERS.ANIMAL_IMAGES);
}
