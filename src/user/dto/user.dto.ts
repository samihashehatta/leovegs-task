import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';
import { Match } from '../decorators/match.decorator';
import { UserRole } from '../enums/role.enum';
export class CreateUserBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  @IsString()
  public password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(UserRole)
  public role: UserRole;
}

export class UpdateUserInfoDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsStrongPassword()
  public password: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(UserRole)
  public role: UserRole;

  @ApiProperty()
  @ValidateIf((val) => !!val.password)
  @IsStrongPassword()
  @Match('password', { message: 'Password and confirmPassword does not match' })
  @IsNotEmpty()
  confirmPassword: string;
}
export class CurrentUserDto {
  public id: string;
  public email: string;
  public role: UserRole;
}
