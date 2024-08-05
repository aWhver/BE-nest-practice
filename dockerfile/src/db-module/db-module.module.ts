import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      host: '192.168.124.6',
      username: 'root',
      password: 'admin0326',
      database: 'docker-test',
      autoLoadEntities: true,
      synchronize: true,
      connectorPackage: 'mysql2',
      logging: true,
      poolSize: 10,
      extra: {
        authPlugin: 'sha256_password',
      },
    }),
  ],
})
export class DbModuleModule {}
