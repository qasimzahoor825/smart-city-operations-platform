import type { Request, Response } from "express";
import { paymentService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";
import type { BillQuery, PayBillDto, TransactionQuery } from "../dto";

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

export const paymentController = {
  listBills: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: BillQuery = { page, limit };
    if (typeof req.query.userId === "string") query.userId = req.query.userId;
    if (req.user?.id) query.userName = req.user.email ? req.user.email.split("@")[0] : "Citizen";
    if (typeof req.query.status === "string") query.status = req.query.status;
    const { items, pagination } = await paymentService.listBills(query);
    res.json(createListResponse(items, pagination, "Bills fetched"));
  }),

  getBill: asyncHandler(async (req: Request, res: Response) => {
    const bill = await paymentService.getBill(req.params.id);
    res.json(createApiResponse(true, "Bill fetched", bill));
  }),

  pay: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<PayBillDto>(req);
    const result = await paymentService.pay(dto);
    res.status(201).json(createApiResponse(true, "Payment processed", result));
  }),

  listTransactions: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: TransactionQuery = { page, limit };
    if (typeof req.query.userId === "string") query.userId = req.query.userId;
    const { items, pagination } = await paymentService.listTransactions(query);
    res.json(createListResponse(items, pagination, "Transactions fetched"));
  }),

  summary: asyncHandler(async (_req: Request, res: Response) => {
    const summary = await paymentService.summary();
    res.json(createApiResponse(true, "Payment summary", summary));
  }),
};

export default paymentController;