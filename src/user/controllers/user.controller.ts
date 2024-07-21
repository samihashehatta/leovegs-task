import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserBodyDto, UpdateUserInfoDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/:id')
  @UseGuards(AuthGuard, RoleGuard)
  retrieve(@Param('id') id: string) {
    return this.userService.get(id);
  }

  @Post()
  create(@Body() body: CreateUserBodyDto): Promise<User> {
    return this.userService.create(body);
  }

  @Put('/:id')
  @UseGuards(AuthGuard, RoleGuard)
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateUserInfoDto,
  ) {
    return this.userService.update(id, body, req['user']);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard, RoleGuard)
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
