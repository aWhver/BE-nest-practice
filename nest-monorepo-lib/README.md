## Description

nest 项目 `monorepo` 和 `lib` 的练习，用于管理多个nest项目/微服务项目。
- `nest g app appname(自定义)` 会在根目录下的`apps`文件夹下生成一个 `appname` 的文件夹，是一个 nest项目.
- `nest g lib libname(自定义)` 会在根目录下的`libs`文件夹下生成一个 `libname` 的文件夹。复用的逻辑代码可以写在这。同时会在根目录下的 `tsconfig.json`生成默认的路径别名
```
"paths": {
  "@app/lib1": [
    "libs/lib1/src"
  ],
  "@app/lib1/*": [
    "libs/lib1/src/*"
  ]
}
```
- 在根目录下运行项目 `npm run start:dev` ，默认运行在 `nest-cli.json` 中 `sourceRoot`、`root`、`compilerOptions.tsConfigPath` 配置了这３个属性的 nest应用。想要启动其他应用，运行命令 `npm run start:dev appname`

- 不想跑服务，就只编译 `lib` ,运行 `npm run start:dev libname`

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

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
