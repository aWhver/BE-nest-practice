## Description

`nestjs`基本的 api 练习、typeorm的接入，数据库的迁移、文件(包含切片，切片合并)上传

## Notes

本项目接入`typeorm` 的配置项 `synchronize` 默认设置为 `false`.如果启动项目操作数据库的时候报 *找不到某某表* 的时候，是因为没有同步建库，找不到表，无法做 sql 的操作，可以用下面３种方式解决

- １、可以将 `env` 文件的 `DB_SYNC` 的值改为 `true`.
- ２、了解相关的 [migration](https://typeorm.bootcss.com/migrations) 的知识，然后通过其手动控制数据库的表.`package.json`配置了相关命令
- ３、直接`typeorm`在配置处写死 `synchronize` 为 `false`

## Functional description

- 新增了 `acl` 权限。可以访问 acl.html文件。包含了`session`、`redis`的运用.涉及目录文件 `src/user`、 `src/permission`、`src/redis`、`ｐermission.guard.ts`

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
