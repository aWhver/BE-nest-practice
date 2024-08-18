import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { User } from './user/entities/user.entity';
import { Role } from './role/entities/role.entity';
import { Permission } from './permission/entities/permission.entity';
import { MeetingRoom } from './meeting-rooms/entities/meeting-room.entity';
import { Booking } from './booking/entities/booking.entity';

config({
  path: path.join(__dirname, `.env.stage.${process.env.STAGE}`),
});

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // 生成环境不开启这个选项（true），会造成数据丢失，因为改了数据库架构，
  // 表的修改需要手动控制，需要使用 migrations来控制，
  // typeorm 提供了 migration:create,generate,run,revert命令
  synchronize: process.env.DB_SYNC === 'true',
  migrations: ['src/migrations/**.ts'],
  entities: [User, Role, Permission, MeetingRoom, Booking],
  logging: true,
  poolSize: 10,
  connectorPackage: 'mysql2',
  extra: {
    authPlugin: 'sha256_password',
  },
  timezone: 'Asia/Shanghai',
});
