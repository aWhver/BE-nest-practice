import { PartialType } from '@nestjs/mapped-types';
import { CreateMiddlewarePracticeDto } from './create-middleware-practice.dto';

export class UpdateMiddlewarePracticeDto extends PartialType(CreateMiddlewarePracticeDto) {}
