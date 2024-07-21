import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { AppService } from '../app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JsonApiSerializerService } from './services/json-api-serializer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.SECRET,
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AppService, JsonApiSerializerService],
})
export class UserModule {}
