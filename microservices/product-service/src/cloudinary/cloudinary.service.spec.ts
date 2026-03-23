import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryService', () => {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') {
        return 'development';
      }

      return undefined;
    }),
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'demo-cloud',
        CLOUDINARY_API_KEY: 'demo-key',
        CLOUDINARY_API_SECRET: 'demo-secret',
      };

      return values[key];
    }),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('maps Cloudinary upload response to image metadata', async () => {
    const pipe = { pipe: jest.fn() };
    jest.spyOn(streamifier, 'createReadStream').mockReturnValue(pipe as never);
    jest.spyOn(cloudinary, 'config').mockReturnValue(undefined);
    jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((_options, callback) => {
      callback?.(undefined, {
        secure_url: 'https://cdn.example.com/products/jacket-main.jpg',
        public_id: 'products/jacket-main',
      } as never);

      return {} as never;
    });

    const service = new CloudinaryService(configService);

    await expect(
      service.uploadProductImage({
        buffer: Buffer.from('image'),
        mimetype: 'image/jpeg',
        originalname: 'jacket-main.jpg',
      }),
    ).resolves.toEqual({
      imageUrl: 'https://cdn.example.com/products/jacket-main.jpg',
      publicId: 'products/jacket-main',
    });

    expect(pipe.pipe).toHaveBeenCalled();
  });

  it('deletes Cloudinary images by public id', async () => {
    jest.spyOn(cloudinary, 'config').mockReturnValue(undefined);
    const destroySpy = jest
      .spyOn(cloudinary.uploader, 'destroy')
      .mockResolvedValue({ result: 'ok' } as never);

    const service = new CloudinaryService(configService);
    await service.deleteImage('products/jacket-main');

    expect(destroySpy).toHaveBeenCalledWith('products/jacket-main', { resource_type: 'image' });
  });
});
