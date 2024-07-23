import { PartialType } from '@nestjs/mapped-types';
import { CreateInterceptorPracticeDto } from './create-interceptor-practice.dto';

export class UpdateInterceptorPracticeDto extends PartialType(CreateInterceptorPracticeDto) {}
