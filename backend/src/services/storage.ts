import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import sharp from 'sharp';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface IStorageService {
  upload(file: UploadedFile): Promise<string>;
  delete(path: string): Promise<void>;
}

export class LocalStorageService implements IStorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'public', 'uploads');
    this.baseUrl = '/uploads';
    
    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: UploadedFile): Promise<string> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    
    // Optimize image
    let buffer = file.buffer;
    let extension = file.originalname.split('.').pop() || 'jpg';

    // Only process images
    if (file.mimetype.startsWith('image/')) {
      try {
        // Convert to WebP for better compression
        buffer = await sharp(file.buffer)
          .resize(1920, 1920, { // Limit max dimensions
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toBuffer();
        
        extension = 'webp';
      } catch (error) {
        console.error('Image optimization failed, falling back to original:', error);
      }
    }

    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = join(this.uploadDir, filename);

    writeFileSync(filepath, buffer);

    return `${this.baseUrl}/${filename}`;
  }

  async delete(path: string): Promise<void> {
    // Extract filename from URL path (e.g. /uploads/image.jpg -> image.jpg)
    const filename = path.split('/').pop();
    if (!filename) return;

    const filepath = join(this.uploadDir, filename);
    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  }
}

// Factory to switch implementations based on ENV
// export const storageService = process.env.STORAGE_TYPE === 's3' ? new S3StorageService() : new LocalStorageService();
export const storageService = new LocalStorageService();
