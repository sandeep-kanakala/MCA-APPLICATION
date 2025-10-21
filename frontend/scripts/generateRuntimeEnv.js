// scripts/generateRuntimeEnv.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// detect which environment we want to use
const RUNTIME_ENV = process.env.RUNTIME_ENV || 'development';

// load environment file (.env.development or .env.production)
dotenv.config({ path: path.resolve(process.cwd(), `.env.${RUNTIME_ENV}`) });
dotenv.config({ path: path.resolve(process.cwd(), `.env`) }); // fallback

// prepare runtime config object
const runtimeConfig = {
  VITE_API_URL: process.env.VITE_API_URL || 'https://fallback.api.com',
  VITE_ENV: RUNTIME_ENV,
};

// generate file under public/
const outPath = path.resolve(process.cwd(), 'public/runtime-env.js');
const content = `window.__RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig, null, 2)};`;

fs.writeFileSync(outPath, content);
console.log(` runtime-env.js generated for "${RUNTIME_ENV}" at ${outPath}`);
