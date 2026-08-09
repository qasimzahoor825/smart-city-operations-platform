"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
const specs = (0, swagger_jsdoc_1.default)(options);
function setupSwagger(app) {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
    app.get("/swagger.json", (_req, res) => {
        res.json(specs);
    });
}
//# sourceMappingURL=index.js.map