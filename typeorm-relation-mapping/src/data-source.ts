import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { IdCard } from './entity/IdCard';
import { Department } from './entity/Department';
import { Employee } from './entity/Employee';
import { Article } from './entity/Article';
import { Tag } from './entity/Tag';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'admin0326',
  database: 'typeorm-test',
  synchronize: true,
  logging: true,
  entities: [User, IdCard, Department, Employee, Article, Tag],
  migrations: [],
  subscribers: [],
  connectorPackage: 'mysql2',
  extra: {
    authPlugin: 'sha256_password',
  },
});
