"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
function bodyOf(req) {
    return req.parsedBody;
}
exports.paymentController = {
    listBills: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.userId === "string")
            query.userId = req.query.userId;
        if (typeof req.query.status === "string")
            query.status = req.query.status;
        const { items, pagination } = await service_1.paymentService.listBills(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Bills fetched"));
    }),
    getBill: (0, utils_1.asyncHandler)(async (req, res) => {
        const bill = await service_1.paymentService.getBill(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Bill fetched", bill));
    }),
    pay: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const result = await service_1.paymentService.pay(dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Payment processed", result));
    }),
    listTransactions: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.userId === "string")
            query.userId = req.query.userId;
        const { items, pagination } = await service_1.paymentService.listTransactions(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Transactions fetched"));
    }),
    summary: (0, utils_1.asyncHandler)(async (_req, res) => {
        const summary = await service_1.paymentService.summary();
        res.json((0, utils_1.createApiResponse)(true, "Payment summary", summary));
    }),
};
exports.default = exports.paymentController;
//# sourceMappingURL=index.js.map