import { z } from "zod";

const roleValues = ["CITIZEN", "OFFICER", "DEPARTMENT_HEAD", "SUPER_ADMIN"] as const;

export const roleParamSchema = z.object({
  role: z.enum(roleValues),
});