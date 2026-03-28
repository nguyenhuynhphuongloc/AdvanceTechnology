import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
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
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const isTest = this.configService.get<string>('NODE_ENV') === 'test';
    if (isTest) {
      this.isConfigured = true;
      return;
    }

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.trim();
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.trim();

    this.isConfigured = Boolean(cloudName && apiKey && apiSecret);
    if (!this.isConfigured) {
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadProductImage(
    file: Pick<Express.Multer.File, 'buffer' | 'mimetype' | 'originalname'>,
  ): Promise<UploadedProductImage> {
    this.ensureConfigured();

    let result: UploadApiResponse;
    try {
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
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
    } catch (error) {
      const detail =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown Cloudinary error.';
      throw new BadGatewayException(`Cloudinary upload failed: ${detail}`);
    }

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    this.ensureConfigured();
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
      const detail =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown Cloudinary error.';
      throw new BadGatewayException(`Cloudinary delete failed: ${detail}`);
    }
  }

  private ensureConfigured() {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured for product-service. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in microservices/product-service/.env.',
      );
    }
  }
}
