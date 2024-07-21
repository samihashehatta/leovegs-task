// src/utils/create-database.ts
import { DataSource, DataSourceOptions } from 'typeorm';
export const createDatabaseIfNotExists = async (
  options: DataSourceOptions,
): Promise<void> => {
  // Extract database name from options
  const { database } = options;
  // Modify connection options to exclude database name
  const connectionOptions = { ...options, database: undefined };

  const dataSource = new DataSource(connectionOptions);

  try {
    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.createDatabase(database as string, true); // 'true' means if not exists
    await queryRunner.release();
  } finally {
    await dataSource.destroy();
  }
};

// Define your TypeORM configuration here
const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'leovegas',
  synchronize: false,
  logging: false,
};

createDatabaseIfNotExists(dataSourceOptions)
  .then(() => {
    console.log('Database checked/created successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error creating database:', error);
    process.exit(1);
  });
