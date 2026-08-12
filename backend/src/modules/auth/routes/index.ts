import { Router } from "express";
import { authController } from "../controller";
import { requireAuth } from "../../../middleware/auth";
import { authLimiter } from "../../../middleware/rate-limit";
import { validateBody } from "../../../middleware/validate";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from "../validation";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validateBody(registerSchema), authController.register);
authRouter.post("/login", authLimiter, validateBody(loginSchema), authController.login);
authRouter.post("/refresh", authLimiter, validateBody(refreshSchema), authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
authRouter.post("/verify-email", authLimiter, validateBody(verifyEmailSchema), authController.verifyEmail);
authRouter.post("/resend-otp", authLimiter, validateBody(resendVerificationSchema), authController.resendOtp);

authRouter.get("/me", requireAuth, authController.me);
authRouter.patch("/me", requireAuth, validateBody(updateProfileSchema), authController.updateProfile);
authRouter.get("/sessions", requireAuth, authController.sessions);
authRouter.delete("/sessions/:id", requireAuth, authController.revokeSession);
authRouter.post("/change-password", requireAuth, validateBody(changePasswordSchema), authController.changePassword);

export default authRouter;