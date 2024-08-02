import { RegisterUserDto } from './create-rabc-user.dto';

export class LoginUserDto extends RegisterUserDto {}

export class AssignRoleDto {
  userId: number;
  roles: number[];
}
