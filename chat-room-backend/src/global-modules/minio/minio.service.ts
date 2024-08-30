import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MINIO_CLIENT } from 'src/common/const';
import * as Minio from 'minio';
import stream from 'stream';

@Injectable()
export class MinioService {
  @Inject(MINIO_CLIENT)
  private minioClient: Minio.Client;

  async presignedObject(
    bucketName: string,
    objectName: string,
    expireIn: number = 3600 * 24,
  ) {
    try {
      return this.minioClient.presignedPutObject(
        bucketName,
        objectName,
        expireIn,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async putObject(
    bucketName: string,
    objectName: string,
    stream: stream.Readable | Buffer | string,
  ) {
    try {
      await this.minioClient.putObject(bucketName, objectName, stream);
      return `http://localhost:9000/${bucketName}/${objectName}`;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
