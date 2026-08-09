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
exports.appointmentRepository = exports.appointmentService = exports.appointmentRouter = void 0;
var routes_1 = require("./routes");
Object.defineProperty(exports, "appointmentRouter", { enumerable: true, get: function () { return routes_1.appointmentRouter; } });
var service_1 = require("./service");
Object.defineProperty(exports, "appointmentService", { enumerable: true, get: function () { return service_1.appointmentService; } });
var repository_1 = require("./repository");
Object.defineProperty(exports, "appointmentRepository", { enumerable: true, get: function () { return repository_1.appointmentRepository; } });
__exportStar(require("./dto"), exports);
__exportStar(require("./validation"), exports);
//# sourceMappingURL=index.js.map