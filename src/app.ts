import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import trackRoutes from "./routes/track";
import { errorsHandler } from "./middlewares/errors";
import morgan from "morgan";
import logger from "./providers/logger";

const app: Application = express();

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  logger.info("Test route was triggered!");
  res.send("Server is running! 🚀");
});

app.use("/track", trackRoutes);

app.use(errorsHandler);

export default app;
