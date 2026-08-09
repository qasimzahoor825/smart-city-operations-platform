"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = exports.notificationService = exports.notificationRouter = void 0;
var routes_1 = require("./routes");
Object.defineProperty(exports, "notificationRouter", { enumerable: true, get: function () { return routes_1.notificationRouter; } });
var service_1 = require("./service");
Object.defineProperty(exports, "notificationService", { enumerable: true, get: function () { return service_1.notificationService; } });
var repository_1 = require("./repository");
Object.defineProperty(exports, "notificationRepository", { enumerable: true, get: function () { return repository_1.notificationRepository; } });
__exportStar(require("./dto"), exports);
//# sourceMappingURL=index.js.map