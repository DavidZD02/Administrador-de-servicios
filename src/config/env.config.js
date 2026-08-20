import "dotenv/config";
const requiredEnvVars = ["PORT", "NODE_ENV"];

const missing = [];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missing.push(varName);
  }
}

if (missing.length > 0) {
  console.error(`Error: faltan las siguientes variables de entorno: ${missing.join(", ")}`);
  process.exit(1);
}

export const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
};