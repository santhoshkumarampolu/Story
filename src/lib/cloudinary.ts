import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
const requiredEnvVars = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

// Check if all required environment variables are present
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required Cloudinary environment variable: ${key}`);
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export async function uploadImage(
  file: string,
  options: {
    folder?: string;
    transformation?: any[];
    resource_type?: 'image' | 'video' | 'raw';
  } = {}
): Promise<CloudinaryUploadResponse> {
  try {
    // Validate Cloudinary configuration
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing');
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'story-studio',
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_file_size: 5 * 1024 * 1024, // 5MB
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getImageUrl(publicId: string, options: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'thumb' | 'scale';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}): string {
  const transformation = [
    { width: options.width, height: options.height, crop: options.crop },
    { quality: options.quality || 'auto' },
    { fetch_format: options.format || 'auto' },
  ].filter(Boolean);

  return cloudinary.url(publicId, {
    secure: true,
    transformation,
  });
}

export async function uploadBuffer(
  buffer: Buffer,
  options: {
    folder?: string;
    transformation?: any[];
    resource_type?: 'image' | 'video' | 'raw';
    public_id?: string;
  } = {}
): Promise<CloudinaryUploadResponse> {
  try {
    // Validate Cloudinary configuration
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing');
    }

    // Convert buffer to base64
    const base64String = buffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: options.folder || 'story-studio',
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
      public_id: options.public_id,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_file_size: 5 * 1024 * 1024, // 5MB
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Error uploading buffer to Cloudinary:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 