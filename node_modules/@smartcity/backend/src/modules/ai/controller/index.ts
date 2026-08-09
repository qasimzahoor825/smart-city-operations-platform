import type { Request, Response } from "express";
import { aiService } from "../service";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import type { CategorizeDto } from "../dto";

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

export const aiController = {
  categorize: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CategorizeDto>(req);
    const result = await aiService.categorize(dto);
    res.json(createApiResponse(true, "AI categorization complete", result));
  }),
};

export default aiController;