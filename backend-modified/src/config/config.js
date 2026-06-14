// ESM wrapper around config.cjs so application code can `import` the same config
// that sequelize-cli reads from the .cjs file.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config.cjs');

export default config;
