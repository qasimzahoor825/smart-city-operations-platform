import type { Express } from "express";
import { config } from "../config";

import { authRouter } from "../modules/auth";
import { userRouter } from "../modules/users";
import { roleRouter } from "../modules/roles";
import { citizenRouter } from "../modules/citizens";
import { complaintRouter } from "../modules/complaints";
import { departmentRouter } from "../modules/departments";
import { assetRouter } from "../modules/assets";
import { appointmentRouter } from "../modules/appointments";
import { emergencyRouter } from "../modules/emergency";
import { gisRouter } from "../modules/gis";
import { notificationRouter } from "../modules/notifications";
import { paymentRouter } from "../modules/payments";
import { reportRouter } from "../modules/reports";
import { newsRouter } from "../modules/news";
import { systemRouter } from "../modules/system";
import { aiRouter } from "../modules/ai";
import { analyticsRouter } from "../modules/analytics";
import { auditRouter } from "../modules/audit";
import { slaRouter } from "../modules/sla";

const PREFIX = config.apiPrefix;

export function mountRoutes(app: Express): void {
  app.use(`${PREFIX}/auth`, authRouter);
  app.use(`${PREFIX}/users`, userRouter);
  app.use(`${PREFIX}/roles`, roleRouter);
  app.use(`${PREFIX}/citizens`, citizenRouter);
  app.use(`${PREFIX}/complaints`, complaintRouter);
  app.use(`${PREFIX}/departments`, departmentRouter);
  app.use(`${PREFIX}/assets`, assetRouter);
  app.use(`${PREFIX}/appointments`, appointmentRouter);
  app.use(`${PREFIX}/emergencies`, emergencyRouter);
  app.use(`${PREFIX}/gis`, gisRouter);
  app.use(`${PREFIX}/notifications`, notificationRouter);
  app.use(`${PREFIX}/payments`, paymentRouter);
  app.use(`${PREFIX}/bills`, paymentRouter);
  app.use(`${PREFIX}/reports`, reportRouter);
  app.use(`${PREFIX}/analytics`, analyticsRouter);
  app.use(`${PREFIX}/news`, newsRouter);
  app.use(`${PREFIX}/system`, systemRouter);
  app.use(`${PREFIX}/ai`, aiRouter);
  app.use(`${PREFIX}/audit-logs`, auditRouter);
  app.use(`${PREFIX}/sla`, slaRouter);

  app.get(`${PREFIX}/health`, (_req, res) => {
    res.json({ success: true, status: "UP", service: "SmartCity OS Monolith", timestamp: new Date().toISOString() });
  });
}