import { Inject, Injectable } from '@nestjs/common';
import { Etcd3 } from 'etcd3';
import { ETCD_CLIENT_TOKEN } from './etcd.module';

@Injectable()
export class EtcdService {
  constructor(@Inject(ETCD_CLIENT_TOKEN) private etcdClient: Etcd3) {}

  async put(key: string, value) {
    await this.etcdClient.put(key).value(value);
  }

  async get(key: string) {
    return this.etcdClient.get(key).string();
  }

  async delete(key: string) {
    await this.etcdClient.delete().key(key);
  }

  async registerService(serviceName: string, serviceId: number, metadata) {
    const key = `services/${serviceName}/${serviceId}`;
    // 100s过期
    const lease = this.etcdClient.lease(100);
    await lease.put(key).value(JSON.stringify(metadata));
    lease.on('lost', async () => {
      await this.registerService(serviceName, serviceId, metadata);
    });
  }

  async discoverService(serviceName) {
    const ins = await this.etcdClient
      .getAll()
      .prefix(`services/${serviceName}`)
      .strings();
    return Object.entries(ins).map(([, value]) => JSON.parse(value));
  }

  async watchSerice(serviceName: string, callback) {
    const watcher = await this.etcdClient
      .watch()
      .prefix(`services/${serviceName}`)
      .create();
    watcher
      .on('put', async (event) => {
        console.log('添加新服务', event.key.toString());
        callback(await this.discoverService(serviceName));
      })
      .on('delete', async (event) => {
        console.log('删除服务', event.key.toString());
        callback(await this.discoverService(serviceName));
      });
  }
}
