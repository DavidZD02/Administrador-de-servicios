import app from "./app.js";
import { env } from "./config/env.config.js";
import { connectDB } from './config/database.config.js';

const PORT = env.PORT;

await connectDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});
