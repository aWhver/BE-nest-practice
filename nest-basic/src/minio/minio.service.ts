import { Inject, Injectable } from '@nestjs/common';
import { MINIO_CLIENT_TOKEN } from 'src/common/const';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  @Inject(MINIO_CLIENT_TOKEN)
  private minioClient: Minio.Client;

  async fputObject(bucketName: string, filename: string, file: string) {
    try {
      await this.minioClient.fPutObject(bucketName, filename, file);
    } catch (error) {
      console.log('error', error);
    }
  }

  async presignedPutObject(
    bucketName: string,
    objectName: string,
    expireIn?: number,
  ) {
    const url = await this.minioClient.presignedPutObject(
      bucketName,
      objectName,
      expireIn || 3600,
    );
    return url;
  }
}
