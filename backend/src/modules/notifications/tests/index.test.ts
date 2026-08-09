import { notificationService } from "../service";
import { notificationRepository } from "../repository";
import { NotificationType } from "@prisma/client";
import { authRepository, seedUsers } from "../../auth/repository";

describe("notificationService", () => {
  beforeEach(() => {
    authRepository.users.seed(seedUsers);
    notificationRepository.reset();
  });

  it("lists notifications for a user", async () => {
    const result = await notificationService.list({ userId: "usr_seed_citizen1" });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((n) => n.userId === "usr_seed_citizen1")).toBe(true);
  });

  it("filters unread notifications only", async () => {
    const result = await notificationService.list({ userId: "usr_seed_citizen1", unread: true });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((n) => !n.isRead)).toBe(true);
  });

  it("returns the unread count", async () => {
    const { count } = await notificationService.unreadCount("usr_seed_citizen2");
    expect(count).toBe(1);
  });

  it("marks a single notification as read", async () => {
    const updated = await notificationService.markRead("ntf_seed_001", "usr_seed_citizen1");
    expect(updated.isRead).toBe(true);
  });

  it("does not allow marking another user's notification", async () => {
    await expect(
      notificationService.markRead("ntf_seed_004", "usr_seed_citizen1"),
    ).rejects.toThrow("another user");
  });

  it("marks all notifications as read", async () => {
    const { updated } = await notificationService.readAll("usr_seed_citizen1");
    expect(updated).toBeGreaterThan(0);
    expect(notificationRepository.notifications.all().filter((n) => n.userId === "usr_seed_citizen1" && !n.isRead)).toHaveLength(0);
  });

  it("sends a notification via the mock transport", async () => {
    const result = await notificationService.send({
      userId: "usr_seed_citizen1",
      title: "Test alert",
      message: "This is a test message.",
      type: NotificationType.EMAIL,
      channel: "email",
    });
    expect(result.notification.title).toBe("Test alert");
    expect(result.notification.channel).toBe("email");
    expect(result.delivery.some((d) => d.channel === "email" && d.status === "SENT")).toBe(true);
    expect(notificationRepository.notifications.findById(result.notification.id)).toBeTruthy();
  });

  it("rejects sending to an unknown user", async () => {
    await expect(
      notificationService.send({ userId: "usr_missing", title: "hi", message: "hello" }),
    ).rejects.toThrow("User not found");
  });

  it("returns default preferences for a new user", async () => {
    const prefs = await notificationService.getPreferences("usr_seed_citizen1");
    expect(prefs.email).toBe(true);
    expect(prefs.categories.length).toBeGreaterThan(0);
  });

  it("updates preferences", async () => {
    const prefs = await notificationService.updatePreferences("usr_seed_citizen1", {
      email: false,
      sms: true,
      categories: ["complaints"],
    });
    expect(prefs.email).toBe(false);
    expect(prefs.sms).toBe(true);
    expect(prefs.categories).toEqual(["complaints"]);
  });
});