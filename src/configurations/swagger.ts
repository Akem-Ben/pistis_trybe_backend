import path from "path";
import { Router } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import jsdocs from "swagger-jsdoc";

dotenv.config();

const swaggerRouter = Router();

const artifactLocation = "/file/api-docs.json";
const fullArtifactPath = `/v1/swagger${artifactLocation}`;

swaggerRouter.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../swagger-ui.html"));
});

swaggerRouter.get(artifactLocation, (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const swaggerSpec = jsdocs({
    swaggerDefinition: {
      openapi: "3.0.1",
      info: { version: "1", title: "Pistis Trybe REST API" },
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
          refreshToken: {
            type: "apiKey",
            in: "header",
            name: "x-refresh-auth",
            description: "Refresh token for authentication",
          },
        },
      },
    },
    apis: [`${process.cwd()}/src/**/*.ts`],
  });

  res.send(swaggerSpec);
});

swaggerRouter.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    explorer: true,
    swaggerUrl: fullArtifactPath,
    customSiteTitle: "Pistis Trybe REST API",
  }),
);

swaggerRouter.get("/docs/index.html", (req, res) => {
  res.redirect("/v1/swagger/docs");
});

export default swaggerRouter;
