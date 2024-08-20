import { Global, Module } from '@nestjs/common';
import { WinstonModule, utilities } from 'nest-winston';
import winston from 'winston';
import 'winston-daily-rotate-file';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory() {
        return {
          level: 'debug',
          transports: [
            new winston.transports.DailyRotateFile({
              level: 'debug',
              dirname: 'daily-log',
              filename: `log-%DATE%.log`,
              datePattern: 'YYYY-MM-DD-hh',
              maxSize: '1M',
            }),
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                utilities.format.nestLike(),
              ),
            }),
          ],
        };
      },
    }),
  ],
})
export class LogModule {}
