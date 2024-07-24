import { Inject, Injectable } from '@nestjs/common';
import { OPTIONS } from 'src/constants';
import { IOptions } from 'src/types';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DbModuleService {
  @Inject(OPTIONS)
  options: IOptions;

  async write(data: any) {
    const path = this.generatePath();
    await fs.writeFile(path, JSON.stringify(data || [], null, 4), {
      encoding: 'utf-8',
    });
  }
  async read() {
    const path = this.generatePath();

    try {
      // 先看是否有目录权限
      await fs.access(path);
    } catch (error) {
      return [];
    }

    const res = await fs.readFile(path, {
      encoding: 'utf-8',
    });

    if (!res) {
      return [];
    }

    return JSON.parse(res);
  }

  private generatePath() {
    return path.join(process.cwd(), 'src/jsons', this.options.path);
  }
}
