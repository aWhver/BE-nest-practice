import { SetMetadata } from '@nestjs/common';
import { SKIP_AUTH } from '../const';

export const skipAuth = () => SetMetadata(SKIP_AUTH, true);
