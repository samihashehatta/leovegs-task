import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../user/entities/user.entity';
import { User1721481238351 } from '../migration/1721481238351-user';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('TYPEORM_HOST'),
  port: configService.get('TYPEORM_PORT)'),
  username: configService.get('TYPEORM_USERNAME'),
  password: configService.get('TYPEORM_PASSWORD'),
  database: configService.get('TYPEORM_DATABASE'),
  entities: [User],
  migrations: [User1721481238351],
  synchronize: false,
  migrationsRun: false,
});
