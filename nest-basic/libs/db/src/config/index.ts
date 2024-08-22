import { registerAs } from '@nestjs/config';

export const algorithmSvcOpt = registerAs('algorithmSvcOpt', () => ({
  transport: +process.env.ALGORITHM_SERVICE_TRANSPORT,
  options: {
    port: +process.env.ALGORITHM_SERVICE_PORT,
  },
}));
