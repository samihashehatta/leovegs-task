import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/user/enums/role.enum';
import { CreateUserBodyDto } from '../src/user/dto/user.dto';
import { User } from '../src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

let createdUser;
let createdAdminUser;
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    userRepository = await moduleFixture.resolve<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    await userRepository.delete({ id: createdAdminUser.id });
    await userRepository.delete({ id: createdUser.id });
    await app.close();
  });

  describe('/api/user (POST)', () => {
    it('should create a new user', async () => {
      const userInfo: CreateUserBodyDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'IoX=K@E`M>f3',
        role: UserRole.USER,
      };

      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send(userInfo)
        .expect(201);

      createdUser = response.body as User;
      const { email, name, role } = response.body;
      expect(email).toBe(userInfo.email);
      expect(name).toBe(userInfo.name);
      expect(role).toBe(userInfo.role);
    });
    it('should create a new admin user', async () => {
      const userInfo: CreateUserBodyDto = {
        email: 'Admintest@example.com',
        name: 'Admin Test User',
        password: 'IoX=K@E`M>f3',
        role: UserRole.ADMIN,
      };

      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send(userInfo)
        .expect(201);
      createdAdminUser = response.body as User;
      const { email, name, role } = response.body;
      expect(email).toBe(userInfo.email);
      expect(name).toBe(userInfo.name);
      expect(role).toBe(userInfo.role);
    });
    it('should return 400 if data is invalid', async () => {
      const userInfwo = {
        email: 'invalid-email',
        name: '',
        password: 'short',
      };

      await request(app.getHttpServer())
        .post('/api/user')
        .send(userInfwo)
        .expect(400);
    });
  });

  describe('/api/user/:id (GET) AS user', () => {
    it('should return a user by id ', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/user/${createdUser.id}`)
        .set('Authorization', `Bearer ${createdUser.accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject(createdUser);
    });

    it('should return 403 if user try to get other user info', async () => {
      await request(app.getHttpServer())
        .get(`/api/user/12`)
        .set('Authorization', `Bearer ${createdUser.accessToken}`)
        .expect(403);
    });
  });

  describe('/api/user/:id (GET) AS user', () => {
    it('should return a user by id ', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/user/${createdUser.id}`)
        .set('Authorization', `Bearer ${createdUser.accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject(createdUser);
    });

    it('should return 403 if user try to get other user info', async () => {
      await request(app.getHttpServer())
        .get(`/api/user/12`)
        .set('Authorization', `Bearer ${createdUser.accessToken}`)
        .expect(403);
    });
  });
  describe('/api/user/:id (GET) AS Admin', () => {
    it('should return a user by id ', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/user/${createdAdminUser.id}`)
        .set('Authorization', `Bearer ${createdAdminUser.accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject(createdAdminUser);
    });

    it('should return any user if its an admin ', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/user/${createdUser.id}`)
        .set('Authorization', `Bearer ${createdAdminUser.accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject(createdUser);
    });
  });
  describe('/api/user/:id (DELETE)', () => {
    it('should return 404 if an admin tries to delete inexistence user ', async () => {
      await request(app.getHttpServer())
        .delete(`/api/user/wrong-id`)
        .set('Authorization', `Bearer ${createdAdminUser.accessToken}`)
        .expect(404);
    });
    it('should return 403 if an admin tries to delete itself ', async () => {
      await request(app.getHttpServer())
        .delete(`/api/user/${createdAdminUser.id}`)
        .set('Authorization', `Bearer ${createdAdminUser.accessToken}`)
        .expect(403);
    });
    it('should return 403 if a user tries to delete itself ', async () => {
      await request(app.getHttpServer())
        .delete(`/api/user/${createdUser.id}`)
        .set('Authorization', `Bearer ${createdUser.accessToken}`)
        .expect(403);
    });
    it('Admin can delete a user ', async () => {
      await request(app.getHttpServer())
        .delete(`/api/user/${createdUser.id}`)
        .set('Authorization', `Bearer ${createdAdminUser.accessToken}`)
        .expect(200);
      const deletedUser = await userRepository.findOneBy({
        id: createdUser.id,
      });
      expect(deletedUser).toBeNull();
    });
  });
});
