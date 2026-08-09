import { emergencyService } from "../service";
import { emergencyRepository } from "../repository";
import { EmergencyStatus, EmergencyType, TicketPriority } from "@prisma/client";
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

describe("emergencyService", () => {
  beforeEach(() => {
    emergencyRepository.reset();
  });

  it("seeds fire, flood and medical emergencies", async () => {
    const { items } = await emergencyService.list();
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.some((e) => e.type === EmergencyType.FIRE)).toBe(true);
    expect(items.some((e) => e.type === EmergencyType.FLOOD)).toBe(true);
    expect(items.some((e) => e.type === EmergencyType.MEDICAL)).toBe(true);
    expect(items.every((e) => e.timeline.length > 0)).toBe(true);
  });

  it("creates a reported emergency with a timeline entry", async () => {
    const emergency = await emergencyService.create(citizen, {
      type: EmergencyType.ACCIDENT,
      title: "Car accident on Market Road",
      description: "Two vehicles involved near the roundabout.",
      severity: TicketPriority.HIGH,
    });
    expect(emergency.status).toBe(EmergencyStatus.REPORTED);
    expect(emergency.reportedById).toBe(citizen.id);
    expect(emergency.ref.startsWith("EMG-")).toBe(true);
    expect(emergency.timeline.length).toBe(1);
  });

  it("defaults severity to HIGH", async () => {
    const emergency = await emergencyService.create(citizen, {
      type: EmergencyType.MEDICAL,
      title: "Fall in the park",
      description: "Elderly visitor fell near the fountain.",
    });
    expect(emergency.severity).toBe(TicketPriority.HIGH);
  });

  it("dispatches a unit and appends to the timeline", async () => {
    const emergency = await emergencyService.create(citizen, {
      type: EmergencyType.FIRE,
      title: "Kitchen fire",
      description: "Small fire in a residential kitchen.",
    });
    const dispatched = await emergencyService.dispatch(
      emergency.id,
      { status: EmergencyStatus.DISPATCHED, note: "Units rolling", unit: "Engine 7" },
      officer,
    );
    expect(dispatched.status).toBe(EmergencyStatus.DISPATCHED);
    expect(dispatched.dispatchedUnit).toBe("Engine 7");
    expect(dispatched.timeline.length).toBe(2);
    expect(dispatched.timeline[1].includes("Engine 7")).toBe(true);
  });

  it("forbids citizens from dispatching", async () => {
    const emergency = await emergencyService.create(citizen, {
      type: EmergencyType.FLOOD,
      title: "Basement flooding",
      description: "Water entering a residential basement.",
    });
    await expect(
      emergencyService.dispatch(emergency.id, { status: EmergencyStatus.DISPATCHED }, citizen),
    ).rejects.toThrow("Only emergency response staff");
  });

  it("prevents re-dispatch of a resolved emergency", async () => {
    const emergency = await emergencyService.create(citizen, {
      type: EmergencyType.MEDICAL,
      title: "Resolved case",
      description: "Patient treated on scene.",
    });
    await emergencyService.dispatch(emergency.id, { status: EmergencyStatus.RESOLVED }, officer);
    await expect(
      emergencyService.dispatch(emergency.id, { status: EmergencyStatus.DISPATCHED }, officer),
    ).rejects.toThrow("cannot be re-dispatched");
  });

  it("filters by status and type", async () => {
    const { items } = await emergencyService.list({ type: EmergencyType.FIRE });
    expect(items.every((e) => e.type === EmergencyType.FIRE)).toBe(true);
    const active = await emergencyService.list({ status: EmergencyStatus.REPORTED });
    expect(active.items.every((e) => e.status === EmergencyStatus.REPORTED)).toBe(true);
  });

  it("aggregates statistics by status and type", async () => {
    const stats = await emergencyService.stats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.active).toBeGreaterThan(0);
    expect(Object.keys(stats.byStatus).length).toBe(6);
    expect(Object.keys(stats.byType).length).toBe(5);
  });
});