import { authRepository, seedUsers } from "../../modules/auth/repository";
import { departmentRepository, seedDepartments } from "../../modules/departments/repository";
import { roleRepository, seedRoles } from "../../modules/roles/repository";
import { complaintRepository } from "../../modules/complaints/repository";
import { assetRepository } from "../../modules/assets/repository";
import { emergencyRepository } from "../../modules/emergency/repository";
import { appointmentRepository } from "../../modules/appointments/repository";
import { paymentRepository } from "../../modules/payments/repository";
import { notificationRepository } from "../../modules/notifications/repository";
import { reportRepository } from "../../modules/reports/repository";
import { systemRepository } from "../../modules/system/repository";
import { gisRepository } from "../../modules/gis/repository";
import { newsRepository } from "../../modules/news/repository";

/**
 * Demo-mode seeder — fills the in-memory repositories so the platform is fully
 * usable without a MongoDB connection (serverless/Vercel fallback). It never
 * writes to Mongo; when a database IS connected the normal bootstrap + hydration
 * path supplies the same data from the live collections.
 */
export function seedInMemoryDemo(): void {
  authRepository.users.seed(seedUsers);
  departmentRepository.departments.seed(seedDepartments);
  roleRepository.roles.seed(seedRoles);
  complaintRepository.reset();
  assetRepository.reset();
  emergencyRepository.reset();
  appointmentRepository.reset();
  paymentRepository.reset();
  notificationRepository.reset();
  reportRepository.reset();
  systemRepository.reset();
  gisRepository.reset();
  newsRepository.reset();
}

export default seedInMemoryDemo;
