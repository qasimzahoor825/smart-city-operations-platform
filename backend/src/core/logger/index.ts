import winston from "winston";

const { combine, timestamp, printf, colorize, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts }) => {
  return `${ts} [${level.toUpperCase()}] ${message}`;
});

const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === "production";

const transports: winston.transport[] = [];

if (!isServerless) {
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  );
}

transports.push(
  new winston.transports.Console({
    format: isServerless ? combine(timestamp(), json()) : combine(colorize(), timestamp(), consoleFormat),
  }),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports,
});

export default logger;
