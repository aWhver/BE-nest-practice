import { Injectable } from '@nestjs/common';

@Injectable()
export class Lib1Service {
  getLibName() {
    return 'lib1';
  }
}
