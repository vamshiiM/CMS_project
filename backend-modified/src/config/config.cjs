// CommonJS on purpose: sequelize-cli loads this file directly.
require('dotenv').config();

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false,
};

const useUrl = !!process.env.DATABASE_URL;

const withUrl = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
};

module.exports = {
  development: useUrl ? withUrl : common,
  test: useUrl ? withUrl : common,
  production: useUrl
    ? withUrl
    : { ...common, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } },
};
