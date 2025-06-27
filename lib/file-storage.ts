import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// Storage folder constants
export const STORAGE_FOLDERS = {
  USER_AVATARS: "user-avatars",
  ANIMAL_IMAGES: "animal-images",
} as const;

// Base upload directory
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
async function ensureUploadDir(folder: string) {
  const fullPath = join(UPLOAD_DIR, folder);
  if (!existsSync(fullPath)) {
    await mkdir(fullPath, { recursive: true });
  }
  return fullPath;
}

// Upload image to a specific folder
export async function uploadImage(
  file: File,
  folder: string = STORAGE_FOLDERS.USER_AVATARS
): Promise<string | null> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2)}_${Date.now()}.${fileExt}`;

    const uploadPath = await ensureUploadDir(folder);
    const filePath = join(uploadPath, fileName);

    await writeFile(filePath, buffer);

    // Return the public URL path
    return `/uploads/${folder}/${fileName}`;
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

// Delete image from local storage
export async function deleteImage(url: string): Promise<boolean> {
  try {
    const { unlink } = await import("fs/promises");

    // Convert URL to file path
    const filePath = join(process.cwd(), "public", url);

    if (existsSync(filePath)) {
      await unlink(filePath);
      return true;
    }

    return false;
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
  // Check file size (use env var or default to 5MB)
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || "5242880");
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Image must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file type (use env var or default allowed types)
  const allowedTypesStr =
    process.env.ALLOWED_FILE_TYPES ||
    "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml";
  const allowedTypes = allowedTypesStr.split(",");

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Image must be a valid image file (JPEG, JPG, PNG, GIF, WebP, BMP, TIFF, SVG)",
    };
  }

  return { valid: true };
}

// List images in a specific folder
export async function listImages(folder: string): Promise<string[]> {
  try {
    const { readdir } = await import("fs/promises");
    const uploadPath = join(UPLOAD_DIR, folder);

    if (!existsSync(uploadPath)) {
      return [];
    }

    const files = await readdir(uploadPath);

    // Return public URLs for all images
    return files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => `/uploads/${folder}/${file}`);
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
