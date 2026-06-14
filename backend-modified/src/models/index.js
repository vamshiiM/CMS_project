import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import configAll from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = configAll[env];

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

const db = {};

const files = fs
  .readdirSync(__dirname)
  .filter((f) => f !== 'index.js' && f.endsWith('.js'));

for (const file of files) {
  const mod = await import(pathToFileURL(path.join(__dirname, file)).href);
  const define = mod.default;
  const model = define(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export const { User, Post, PostVersion } = db;
export { sequelize, Sequelize };
export default db;
