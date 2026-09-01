"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
function bodyOf(req) {
    return req.parsedBody;
}
exports.aiController = {
    categorize: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const result = await service_1.aiService.categorize(dto);
        res.json((0, utils_1.createApiResponse)(true, "AI categorization complete", result));
    }),
    chat: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const result = await service_1.aiService.chat(dto, req.user);
        res.json((0, utils_1.createApiResponse)(true, "AI assistant reply", result));
    }),
    validateImage: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const result = await service_1.aiService.validateImage(dto);
        res.json((0, utils_1.createApiResponse)(true, "Image validation complete", result));
    }),
    chatStream: async (req, res) => {
        const dto = bodyOf(req);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders?.();
        const write = (event, data) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };
        try {
            for await (const message of service_1.aiService.chatStream(dto, req.user)) {
                write(message.type, message);
            }
        }
        catch {
            write("error", { message: "Stream failed" });
        }
        finally {
            res.end();
        }
    },
};
exports.default = exports.aiController;
//# sourceMappingURL=index.js.map