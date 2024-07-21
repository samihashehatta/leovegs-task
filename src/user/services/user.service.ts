import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserBodyDto,
  CurrentUserDto,
  UpdateUserInfoDto,
} from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userInfo: CreateUserBodyDto): Promise<User> {
    const { email, name, password, role } = userInfo;
    const newUser = new User();
    newUser.email = email;
    newUser.name = name;
    newUser.role = role;
    try {
      newUser.password = await this.hashPassword(password);
      // create user to get the id to use afterwards
      const userCreated = await this.userRepository.save(newUser);
      // save token encrypted
      newUser.accessToken = await this.jwtService.signAsync({
        id: userCreated.id,
        email,
        role,
      });
      return this.userRepository.save(newUser);
    } catch (error) {
      throw error;
    }
  }

  async delete(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('This user not found');
    }
    return this.userRepository.delete({ id: userId });
  }
  async update(
    userId: string,
    userInfo: UpdateUserInfoDto,
    currentUser: CurrentUserDto,
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (userInfo.role && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change the user role');
    }
    if (!user) {
      throw new NotFoundException('This user not found');
    }
    Object.assign(user, userInfo);

    delete userInfo.confirmPassword;
    if (userInfo.password) {
      userInfo.password = await bcrypt.hash(userInfo.password, 10);
    }
    try {
      await this.userRepository.update({ id: userId }, userInfo);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async get(userId: string) {
    try {
      return this.userRepository.findOneBy({ id: userId });
    } catch (error) {
      throw error;
    }
  }

  async validateRequestedAction(
    userId: string,
    currentUser: CurrentUserDto,
    action: string,
  ) {
    const { id, role } = currentUser;
    const unauthorizedAction =
      (action === 'DELETE' && id === userId) ||
      (role === UserRole.USER && id !== userId);
    if (unauthorizedAction) {
      throw new ForbiddenException(
        'You dont the correct role to do this action',
      );
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(
        'The user you are trying to change does not exist ',
      );
    }
  }
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
