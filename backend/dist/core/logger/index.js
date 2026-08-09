"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, colorize, json } = winston_1.default.format;
const consoleFormat = printf(({ level, message, timestamp: ts }) => {
    return `${ts} [${level.toUpperCase()}] ${message}`;
});
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp(), json()),
    transports: [
        new winston_1.default.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston_1.default.transports.File({ filename: "logs/combined.log" }),
    ],
});
if (process.env.NODE_ENV !== "production") {
    exports.logger.add(new winston_1.default.transports.Console({
        format: combine(colorize(), timestamp(), consoleFormat),
    }));
}
exports.default = exports.logger;
//# sourceMappingURL=index.js.map