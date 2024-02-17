import { Sequelize } from 'sequelize';
import { DB_USERNAME, DB_PASSWORD, DB_HOSTNAME, DB_PORT, DB_NAME } from 'src/config/db';
import { initializeModelsAndSync } from 'src/models';

const connectionUrl = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

const initializeDatabaseConnection = async () => {
  const sequelize = new Sequelize(connectionUrl, {
    logging: false,
  });

  await initializeModelsAndSync(sequelize);
};

export default initializeDatabaseConnection;
