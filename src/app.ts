import express, { NextFunction, Request, Response, Application } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/error_handlers";
import { pistisTribeRouterV1 } from "./routers";
import { generalAuthFunction } from "./middlewares/authorization";
import { health_check_html } from "./configurations/constants";
import swaggerRouter from "./configurations/swagger";

function createApp() {
  const app: Application = express();

  app.disable("x-powered-by");

  app.use(helmet());

  app.use(express.urlencoded({ extended: true }));

  app.use(compression());

  const corsOptions = {
    methods: ["GET, POST, PUT, DELETE, PATCH"],
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization", "X-Refresh-Auth"],
    exposedHeaders: ["X-Refresh-Auth", "verif-hash"],
  };

  app.use(cors(corsOptions));

  app.use(bodyParser.json());

  app.use(logger("dev"));

  app.use(express.json());

  app.use(cookieParser());

  //Health Check
  app.get("/", (request: Request, response: Response) => {
    response.send(health_check_html);
  });

  app.use("/v1/swagger", swaggerRouter);

  app.use("/v1", generalAuthFunction, pistisTribeRouterV1);

  // Error handler
  app.use(globalErrorHandler);

  app.use(
    (
      error: Error,
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      console.error(error.stack);
      response.status(500).send("Something went wrong");
    },
  );

  return app;
}

export default createApp;
