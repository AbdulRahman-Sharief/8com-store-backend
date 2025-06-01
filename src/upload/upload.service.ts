import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { existsSync, promises as fs, mkdirSync } from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private async compressImage(buffer: Buffer, outputPath: string) {
    try {
      // Compress the image using sharp
      await sharp(buffer)
        .resize(800) // Resize to a width of 800px while maintaining aspect ratio
        .toFile(outputPath);
    } catch (error) {
      console.error('Error during image compression:', error);
      throw new Error('Image compression failed');
    }
  }

  async uploadOnePhoto(photo: Express.Multer.File, filePath: string) {
    try {
      let photoEntry;
      if (photo) {
        const randomName = uuidv4();
        const fileExtension = extname(photo.originalname);
        const filename = `${randomName}${fileExtension}`;
        const filepath = `${filePath}/${filename}`;

        // Ensure the directory exists
        if (!existsSync(filePath)) {
          mkdirSync(filePath, { recursive: true });
        }

        // Compress and save the photo
        await this.compressImage(photo.buffer, filepath);

        photoEntry = {
          public_id: randomName,
          url: filepath,
        };
      }
      if (!photoEntry) return null;
      return photoEntry;
    } catch (error) {
      console.error('Upload error:', error);
      return error;
    }
  }

  async uploadMultiplePhotos(photos: Express.Multer.File[], filePath: string) {
    try {
      const photoEntries = [];
      if (photos && photos.length > 0) {
        for (const photo of photos) {
          const randomName = uuidv4();
          const fileExtension = extname(photo.originalname);
          const filename = `${randomName}${fileExtension}`;
          const filepath = `${filePath}/${filename}`;

          // Ensure the directory exists
          if (!existsSync(filePath)) {
            mkdirSync(filePath, { recursive: true });
          }

          // Compress and save the photo
          await this.compressImage(photo.buffer, filepath);

          photoEntries.push({
            public_id: randomName,
            url: filepath,
          });
        }
      }
      if (photoEntries.length <= 0) return null;
      return photoEntries;
    } catch (error) {
      console.error('Upload error:', error);
      return error;
    }
  }

  async deleteOnePhoto(photoPath: string) {
    try {
      await fs.unlink(photoPath);
      console.log(`File ${photoPath} deleted successfully`);
      return {
        success: true,
        message: `File ${photoPath} deleted successfully`,
      };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, message: 'Error deleting the file', error };
    }
  }

  async deleteMultiplePhotos(photoPaths: string[]) {
    try {
      console.log('Deleting files:', photoPaths);
      const deletePromises = photoPaths.map((photoPath) =>
        fs.unlink(photoPath),
      );
      await Promise.all(deletePromises);

      console.log(`Files ${photoPaths.join(', ')} deleted successfully`);
      return {
        success: true,
        message: `Files ${photoPaths.join(', ')} deleted successfully`,
      };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, message: 'Error deleting the files', error };
    }
  }
}
