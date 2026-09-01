import type { Request, Response } from "express";
import { aiService } from "../service";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import type { CategorizeDto, ChatDto, ValidateImageDto } from "../dto";

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

export const aiController = {
  categorize: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CategorizeDto>(req);
    const result = await aiService.categorize(dto);
    res.json(createApiResponse(true, "AI categorization complete", result));
  }),

  chat: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<ChatDto>(req);
    const result = await aiService.chat(dto, req.user);
    res.json(createApiResponse(true, "AI assistant reply", result));
  }),

  validateImage: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<ValidateImageDto>(req);
    const result = await aiService.validateImage(dto);
    res.json(createApiResponse(true, "Image validation complete", result));
  }),

  chatStream: async (req: Request, res: Response) => {
    const dto = bodyOf<ChatDto>(req);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const write = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      for await (const message of aiService.chatStream(dto, req.user)) {
        write(message.type, message);
      }
    } catch {
      write("error", { message: "Stream failed" });
    } finally {
      res.end();
    }
  },
};

export default aiController;