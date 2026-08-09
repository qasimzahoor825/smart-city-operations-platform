import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartCity OS — Monolith API",
      version: "1.0.0",
      description: "Enterprise Smart City Operating System REST API (monolith deployment).",
    },
    servers: [{ url: "/api/v1", description: "Monolith API" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/routes/*.ts", "./src/modules/**/dto/*.ts"],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  app.get("/swagger.json", (_req, res) => {
    res.json(specs);
  });
}