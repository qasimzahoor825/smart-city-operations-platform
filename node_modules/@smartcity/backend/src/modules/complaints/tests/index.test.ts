import { complaintService } from "../service";
import { complaintRepository } from "../repository";
import { authRepository, seedUsers } from "../../auth/repository";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { UserRole } from "@smartcity/common";
import type { Actor } from "../dto";

const citizen: Actor = {
  id: "usr_seed_citizen1",
  email: "citizen@smartcity.gov",
  role: UserRole.CITIZEN,
};

const otherCitizen: Actor = {
  id: "usr_seed_citizen2",
  email: "james@example.com",
  role: UserRole.CITIZEN,
};

const officer: Actor = {
  id: "usr_seed_officer1",
  email: "officer@publicworks.gov",
  role: UserRole.OFFICER,
  departmentId: "dept-public-works",
};

describe("complaintService", () => {
  beforeEach(() => {
    authRepository.users.seed(seedUsers);
    complaintRepository.reset();
  });

  it("creates a complaint with a ref, SLA deadline and timeline entry", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Broken park bench",
      description: "The wooden bench at the lake is broken.",
      category: "PARK",
    });
    expect(complaint.status).toBe(TicketStatus.SUBMITTED);
    expect(complaint.priority).toBe(TicketPriority.MEDIUM);
    expect(complaint.ref.startsWith("CMP-")).toBe(true);
    expect(complaint.slaDeadline).toBeTruthy();
    expect(complaint.slaHours).toBe(48);
    expect(complaintRepository.timeline.all().filter((t) => t.complaintId === complaint.id).length).toBe(1);
  });

  it("applies a priority-based SLA when creating", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Gas leak reported",
      description: "Strong gas smell outside the shops.",
      category: "OTHER",
      priority: TicketPriority.CRITICAL,
    });
    expect(complaint.slaHours).toBe(4);
  });

  it("assigns a complaint to a seeded officer", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Broken streetlight",
      description: "Lamp post flickers every night.",
      category: "STREET_LIGHT",
    });
    const assigned = await complaintService.assign(
      complaint.id,
      { officerId: "usr_seed_officer1", departmentId: "dept-public-works" },
      officer,
    );
    expect(assigned.status).toBe(TicketStatus.ASSIGNED);
    expect(assigned.assignedToId).toBe("usr_seed_officer1");
    expect(assigned.assignedToName).toBe("Bilal Ahmed");
  });

  it("rejects assigning to a non-officer", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Noise complaint",
      description: "Loud construction after hours.",
      category: "NOISE",
    });
    await expect(
      complaintService.assign(complaint.id, { officerId: "usr_seed_citizen2" }, officer),
    ).rejects.toThrow("not an officer");
  });

  it("marks a complaint resolved and records resolvedAt", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Pothole on Elm Street",
      description: "Deep pothole near the school crossing.",
      category: "ROAD",
    });
    const resolved = await complaintService.updateStatus(
      complaint.id,
      { status: TicketStatus.RESOLVED, note: "Crew patched it" },
      officer,
    );
    expect(resolved.status).toBe(TicketStatus.RESOLVED);
    expect(resolved.resolvedAt).toBeTruthy();
    const timeline = complaintRepository.timeline.all().filter((t) => t.complaintId === complaint.id);
    expect(timeline.some((t) => t.status === TicketStatus.RESOLVED)).toBe(true);
  });

  it("flags the SLA as breached when resolved after the deadline", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Late response test",
      description: "A test complaint that will be delayed.",
      category: "OTHER",
    });
    complaintRepository.complaints.update(complaint.id, {
      slaDeadline: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    });
    const resolved = await complaintService.updateStatus(
      complaint.id,
      { status: TicketStatus.RESOLVED },
      officer,
    );
    expect(resolved.slaBreached).toBe(true);
    const timeline = complaintRepository.timeline.all().filter((t) => t.complaintId === complaint.id);
    expect(timeline.some((t) => t.note?.includes("SLA"))).toBe(true);
  });

  it("prevents a citizen managing another citizen's complaint", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Private complaint",
      description: "Only visible to the owner.",
      category: "OTHER",
    });
    await expect(
      complaintService.update(complaint.id, otherCitizen, { title: "Hijacked" }),
    ).rejects.toThrow("only manage your own");
  });

  it("allows staff to update any complaint", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Drainage blocked",
      description: "Storm drain is clogged.",
      category: "WATER",
    });
    const updated = await complaintService.update(complaint.id, officer, { priority: TicketPriority.HIGH });
    expect(updated.priority).toBe(TicketPriority.HIGH);
  });

  it("adds and lists comments", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "Commentable complaint",
      description: "Comments should attach to this issue.",
      category: "OTHER",
    });
    const comment = await complaintService.addComment(complaint.id, citizen, { body: "Any update?" });
    expect(comment.body).toBe("Any update?");
    const comments = await complaintService.listComments(complaint.id);
    expect(comments.length).toBe(1);
    expect(comments[0].authorId).toBe(citizen.id);
  });

  it("filters and paginates the list", async () => {
    const result = await complaintService.list({ category: "ROAD", page: 1, limit: 10 });
    expect(result.items.every((c) => c.category === "ROAD")).toBe(true);
  });

  it("aggregates statistics", async () => {
    const stats = await complaintService.stats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.open).toBeGreaterThan(0);
    expect(stats.resolved).toBeGreaterThan(0);
    expect(Object.keys(stats.byStatus).length).toBe(12);
    expect(Object.keys(stats.byPriority).length).toBe(4);
    expect(stats.byCategory).toBeTruthy();
  });

  it("deletes a complaint and its children", async () => {
    const complaint = await complaintService.create(citizen, {
      title: "To be deleted",
      description: "This complaint will be removed.",
      category: "OTHER",
    });
    await complaintService.addComment(complaint.id, citizen, { body: "bye" });
    await complaintService.remove(complaint.id, citizen);
    await expect(complaintService.getById(complaint.id)).rejects.toThrow("not found");
    expect((await complaintService.listComments(complaint.id)).length).toBe(0);
  });
});