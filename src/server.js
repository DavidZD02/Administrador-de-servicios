import app from "./app.js";
import { env } from "./config/env.config.js";
import { connectDB } from "./config/database.config.js";
import { Server } from "socket.io";
import { createServiceSchema } from "./schemas/service.schema.js";
import { formatZodIssues } from "./middlewares/validate.middleware.js";

const PORT = env.PORT;

await connectDB();

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});

const io = new Server(httpServer);
app.set("io", io);

const serviceManager = app.get("serviceManager");

io.on("connection", (socket) => {
  socket.on("service:create", async (data, callback) => {
    const reply = typeof callback === "function" ? callback : () => {};

    const result = createServiceSchema.safeParse(data);
    if (!result.success) {
      return reply({ status: "error", message: formatZodIssues(result.error) });
    }

    try {
      const newService = await serviceManager.createService(result.data);
      io.emit("service:created", newService);
      reply({ status: "success" });
    } catch (error) {
      reply({ status: "error", message: error.message });
    }
  });
});