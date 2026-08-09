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
};
exports.default = exports.aiController;
//# sourceMappingURL=index.js.map