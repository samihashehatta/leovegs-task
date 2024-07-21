/*
https://docs.nestjs.com/guards#guards
*/

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const action = request.method;
    const currentUser = request['user'];
    const userId = request.params['id'];
    if (!currentUser) {
      throw new UnauthorizedException();
    }

    try {
      await this.userService.validateRequestedAction(
        userId,
        currentUser,
        action,
      );
    } catch (error) {
      throw error;
    }
    return true;
  }
}
