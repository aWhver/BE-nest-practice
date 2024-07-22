import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomDecoratorDto } from './create-custom-decorator.dto';

export class UpdateCustomDecoratorDto extends PartialType(CreateCustomDecoratorDto) {}
