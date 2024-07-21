import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateUserBodyDto,
  UpdateUserInfoDto,
  CurrentUserDto,
} from '../dto/user.dto';
import { UserRole } from '../enums/role.enum';
import * as bcrypt from 'bcrypt';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = await module.resolve<UserService>(UserService);
    repository = await module.resolve<Repository<User>>(
      getRepositoryToken(User),
    );
    jwtService = await module.resolve<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user and return it', async () => {
      const userInfo: CreateUserBodyDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        role: UserRole.USER,
      };

      const savedUser = {
        ...userInfo,
        id: '1',
        password: 'hashedPassword',
      } as User;
      const token = 'accessToken';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockJwtService.signAsync.mockResolvedValue(token);
      mockUserRepository.save.mockResolvedValue({
        ...savedUser,
        accessToken: token,
      });

      const result = await service.create(userInfo);

      expect(result).toEqual({ ...savedUser, accessToken: token });
      expect(mockUserRepository.save).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith(userInfo.password, 10);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: savedUser.id,
        email: userInfo.email,
        role: userInfo.role,
      });
    });

    it('should throw an error if saving fails', async () => {
      const userInfo: CreateUserBodyDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        role: UserRole.USER,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      mockUserRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(service.create(userInfo)).rejects.toThrow('Save failed');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const userId = '1';
      const user = { id: userId } as User;

      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await service.delete(userId);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.delete).toHaveBeenCalledWith({ id: userId });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '1';

      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user and return it', async () => {
      const userId = '1';
      const userInfo: UpdateUserInfoDto = {
        email: 'new@example.com',
        name: 'New Name',
        password: 'newPassword',
        role: UserRole.USER,
        confirmPassword: 'newPassword',
      };

      const currentUser: CurrentUserDto = {
        id: '2',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const user = { id: userId } as User;
      const hashedPassword = 'hashedNewPassword';

      mockUserRepository.findOneBy.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      await service.update(userId, userInfo, currentUser);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { ...userInfo, password: hashedPassword },
      );
    });

    it('should throw ForbiddenException if non-admin tries to change role', async () => {
      const userId = '1';
      const userInfo: UpdateUserInfoDto = {
        email: 'new@example.com',
        name: 'New Name',
        password: 'newPassword',
        role: UserRole.ADMIN,
        confirmPassword: 'newPassword',
      };

      const currentUser: CurrentUserDto = {
        id: '2',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      await expect(
        service.update(userId, userInfo, currentUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '1';
      const userInfo: UpdateUserInfoDto = {
        email: 'new@example.com',
        name: 'New Name',
        password: 'newPassword',
        role: UserRole.USER,
        confirmPassword: 'newPassword',
      };

      const currentUser: CurrentUserDto = {
        id: '2',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(userId, userInfo, currentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('get', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      const user = { id: userId } as User;

      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.get(userId);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });
});
