import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { UploadApiErrorResponse } from 'cloudinary';
import streamifier from 'streamifier';

export type UploadedProductImage = {
  imageUrl: string;
  publicId: string;
};

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    const isTest = this.configService.get<string>('NODE_ENV') === 'test';
    if (isTest) {
      return;
    }

    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async uploadProductImage(
    file: Pick<Express.Multer.File, 'buffer' | 'mimetype' | 'originalname'>,
  ): Promise<UploadedProductImage> {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: 'image',
          filename_override: file.originalname,
          use_filename: true,
          unique_filename: true,
        },
        (error?: UploadApiErrorResponse, response?: UploadApiResponse) => {
          if (error || !response) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }

          resolve(response);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }
}
