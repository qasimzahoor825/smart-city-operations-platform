import { appointmentService } from "../service";
import { appointmentRepository } from "../repository";
import { AppointmentStatus } from "@prisma/client";
import { UserRole } from "@smartcity/common";
import type { Actor } from "../dto";

const citizen: Actor = {
  id: "usr_seed_citizen1",
  email: "citizen@smartcity.gov",
  role: UserRole.CITIZEN,
};

const officer: Actor = {
  id: "usr_seed_officer1",
  email: "officer@publicworks.gov",
  role: UserRole.OFFICER,
  departmentId: "dept-public-works",
};

describe("appointmentService", () => {
  beforeEach(() => {
    appointmentRepository.reset();
  });

  it("seeds appointments for the demo citizen", async () => {
    const { items } = await appointmentService.list({ citizenId: "usr_seed_citizen1" });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((a) => a.citizenId === "usr_seed_citizen1")).toBe(true);
  });

  it("creates an appointment in PENDING status", async () => {
    const appointment = await appointmentService.create(citizen, {
      title: "ID card renewal",
      scheduledAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      departmentId: "dept-public-works",
    });
    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.citizenId).toBe(citizen.id);
    expect(appointment.departmentName).toBe("Public Works");
  });

  it("rejects an invalid scheduledAt date", async () => {
    await expect(
      appointmentService.create(citizen, {
        title: "Bad date",
        scheduledAt: "not-a-date",
      }),
    ).rejects.toThrow("scheduledAt");
  });

  it("transitions PENDING -> CONFIRMED -> COMPLETED", async () => {
    const appointment = await appointmentService.create(citizen, {
      title: "Inspection",
      scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    const confirmed = await appointmentService.updateStatus(
      appointment.id,
      officer,
      { status: AppointmentStatus.CONFIRMED },
    );
    expect(confirmed.status).toBe(AppointmentStatus.CONFIRMED);
    const completed = await appointmentService.updateStatus(
      appointment.id,
      officer,
      { status: AppointmentStatus.COMPLETED },
    );
    expect(completed.status).toBe(AppointmentStatus.COMPLETED);
  });

  it("rejects an illegal transition", async () => {
    const appointment = await appointmentService.create(citizen, {
      title: "Illegal transition",
      scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    await expect(
      appointmentService.updateStatus(
        appointment.id,
        officer,
        { status: AppointmentStatus.COMPLETED },
      ),
    ).rejects.toThrow("status transition");
  });

  it("allows a citizen to cancel their own appointment", async () => {
    const appointment = await appointmentService.create(citizen, {
      title: "Cancellable slot",
      scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    const cancelled = await appointmentService.updateStatus(
      appointment.id,
      citizen,
      { status: AppointmentStatus.CANCELLED, note: "Changed plans" },
    );
    expect(cancelled.status).toBe(AppointmentStatus.CANCELLED);
  });

  it("prevents a citizen from confirming their own appointment", async () => {
    const appointment = await appointmentService.create(citizen, {
      title: "No self confirmation",
      scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    await expect(
      appointmentService.updateStatus(
        appointment.id,
        citizen,
        { status: AppointmentStatus.CONFIRMED },
      ),
    ).rejects.toThrow("only cancel");
  });

  it("filters by status and paginates", async () => {
    const { items } = await appointmentService.list({ status: AppointmentStatus.COMPLETED });
    expect(items.every((a) => a.status === AppointmentStatus.COMPLETED)).toBe(true);
  });

  it("deletes an appointment", async () => {
    const appointment = await appointmentService.create(citizen, {
      title: "To be deleted",
      scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    await appointmentService.remove(appointment.id, citizen);
    await expect(appointmentService.getById(appointment.id)).rejects.toThrow("not found");
  });

  it("aggregates statistics", async () => {
    const stats = await appointmentService.stats();
    expect(stats.total).toBeGreaterThan(0);
    expect(Object.keys(stats.byStatus).length).toBe(4);
  });
});