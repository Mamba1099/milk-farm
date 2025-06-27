import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(
  file: File,
  folder: string = "user-avatars"
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

export async function deleteImage(url: string): Promise<boolean> {
  try {
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

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "Image must be less than 5MB" };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Image must be a JPEG, PNG, GIF, or WebP file",
    };
  }

  return { valid: true };
}
