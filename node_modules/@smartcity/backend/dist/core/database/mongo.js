"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGO_STATES = void 0;
exports.mongoState = mongoState;
exports.connectMongo = connectMongo;
exports.disconnectMongo = disconnectMongo;
exports.pingMongo = pingMongo;
exports.getMongoConnection = getMongoConnection;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../../config");
const logger_1 = require("../logger");
exports.MONGO_STATES = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
    99: "disconnected",
};
let cachedUrl = null;
function mongoUri() {
    if (cachedUrl)
        return cachedUrl;
    cachedUrl = config_1.config.database.mongoUrl;
    return cachedUrl;
}
function mongoState() {
    return exports.MONGO_STATES[mongoose_1.default.connection.readyState] ?? "disconnected";
}
async function connectMongo() {
    if (mongoose_1.default.connection.readyState === 1)
        return true;
    try {
        await mongoose_1.default.connect(mongoUri(), {
            serverSelectionTimeoutMS: 5_000,
            maxPoolSize: 10,
            minPoolSize: 1,
        });
        logger_1.logger.info(`MongoDB connected → ${mongoUri()}`);
        return true;
    }
    catch (err) {
        logger_1.logger.warn("MongoDB unavailable — falling back to in-memory repositories", err);
        return false;
    }
}
async function disconnectMongo() {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
        logger_1.logger.info("MongoDB disconnected");
    }
}
async function pingMongo() {
    if (mongoose_1.default.connection.readyState !== 1)
        return false;
    try {
        await mongoose_1.default.connection.db?.admin().ping();
        return true;
    }
    catch {
        return false;
    }
}
function getMongoConnection() {
    return mongoose_1.default.connection;
}
exports.default = mongoose_1.default;
//# sourceMappingURL=mongo.js.map