"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploader = exports.UPLOAD_DIR = void 0;
exports.uploadSingle = uploadSingle;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
function resolveUploadDir() {
    return node_path_1.default.resolve(process.cwd(), "uploads");
}
(0, node_fs_1.mkdirSync)(resolveUploadDir(), { recursive: true });
exports.UPLOAD_DIR = resolveUploadDir();
function uploadSingle(field = "file") {
    return (req, _res, next) => {
        const filename = sanitize(req.headers["x-filename"]) || `${field}-${Date.now().toString(36)}`;
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
            const body = Buffer.concat(chunks);
            if (body.length === 0) {
                next(new Error("No file payload received"));
                return;
            }
            const absPath = node_path_1.default.join(exports.UPLOAD_DIR, filename);
            (0, node_fs_1.writeFileSync)(absPath, body);
            req.uploadedFile = {
                filename,
                path: absPath,
                size: body.length,
                contentType: req.headers["content-type"],
            };
            next();
        });
        req.on("error", next);
    };
}
function sanitize(value) {
    if (!value)
        return undefined;
    return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}
exports.uploader = { single: uploadSingle, dir: exports.UPLOAD_DIR };
exports.default = exports.uploader;
//# sourceMappingURL=index.js.map