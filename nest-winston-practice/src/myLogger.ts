import { LoggerService } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Logger, createLogger, format, transports } from 'winston';

import * as chalk from 'chalk';

const levelColor = {
  error: 'red',
  warn: 'yellow',
};
// 可以直接使用社区已有的 nest-winston https://www.npmjs.com/package/nest-winston

export class MyLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'debug',
      transports: [
        new transports.Console({
          format: format.combine(
            format.printf((data) => {
              // console.log('data', data);
              const { level, message, context, time } = data;
              console.log('level,', level);
              const levelStr = chalk[levelColor[level] || 'white'](level);
              const cxt = chalk.yellow(`context: [${context}]`);
              return `[NEST] ${levelStr} ${chalk.blue(time)} ${cxt} ${message}`;
            }),
            format.colorize(),
          ),
        }),
        new transports.File({
          format: format.combine(
            // message为 ture,label会被写入到ｍessage属性的值中
            format.label({ label: '日志分类', message: true }),
            format.timestamp(),
            format.json(),
          ),
          dirname: 'log',
          filename: 'filelog.log',
        }),
        // new transports.Http({
        //   host: 'http://localhost',
        //   port: 3103,
        //   path: '/log',
        // }),
      ],
    });
  }

  log(message, context) {
    const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    this.logger.info(`${message}`, { context, time });
  }

  error(message, context) {
    const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    this.logger.error(message, { context, time });
  }

  warn(message, context) {
    this.logger.warn(`context: [${context}] : ${message}`);
  }
}
