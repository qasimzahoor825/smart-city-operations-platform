"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.prisma = void 0;
exports.pingDatabase = pingDatabase;
const database_1 = require("@smartcity/database");
var database_2 = require("@smartcity/database");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return database_2.prisma; } });
Object.defineProperty(exports, "database", { enumerable: true, get: function () { return __importDefault(database_2).default; } });
async function pingDatabase() {
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=index.js.map