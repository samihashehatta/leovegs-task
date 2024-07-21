import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1721481238351 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE user (
      id              BIGINT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
      name            VARCHAR(255)    NOT NULL,
      email           VARCHAR(255)    NOT NULL UNIQUE,
      password        VARCHAR(255)    NOT NULL,
      role            ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
      access_token    TEXT    NULL,
      created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) DEFAULT CHARSET=utf8mb3; `);
    await queryRunner.query('ALTER TABLE `user` ;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE user;');
  }
}
