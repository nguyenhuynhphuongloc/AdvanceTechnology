/**
 * Utility for fetching images from Cloudinary using the Admin API.
 * This is used server-side to list resources.
 */

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export interface CloudinaryResource {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
}

export interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

/**
 * Fetches image resources from Cloudinary using the Admin API.
 * Requires API_KEY and API_SECRET to be set in environment.
 */
export async function getCloudinaryImages(limit = 20): Promise<CloudinaryResource[]> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn("Cloudinary credentials not fully configured.");
    return [];
  }

  const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image?max_results=${limit}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary API error: ${response.status} - ${errorText}`);
    }

    const data: CloudinaryResponse = await response.json();
    return data.resources;
  } catch (error) {
    console.error("Failed to fetch Cloudinary images:", error);
    return [];
  }
}

/**
 * Generates an optimized Cloudinary URL for a given public ID.
 */
export function getOptimizedUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}) {
  const { width, height, crop = "fill" } = options;
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);
  
  transformations.push("f_auto", "q_auto");
  
  const transformString = transformations.join(",");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}
