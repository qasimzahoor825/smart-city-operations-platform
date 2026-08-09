import { newsService } from "../service";
import { newsRepository } from "../repository";
import { authRepository, seedUsers } from "../../auth/repository";
import type { Actor } from "../dto";

const admin: Actor = { id: "usr_seed_admin", email: "superadmin@smartcity.gov", role: "SUPER_ADMIN" };
const citizen: Actor = { id: "usr_seed_citizen1", email: "citizen@smartcity.gov", role: "CITIZEN" };

describe("newsService", () => {
  beforeEach(() => {
    authRepository.users.seed(seedUsers);
    newsRepository.reset();
  });

  it("lists only published articles by default", async () => {
    const result = await newsService.list({});
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((a) => a.published)).toBe(true);
  });

  it("lists drafts when published=false is requested", async () => {
    const result = await newsService.list({ published: false });
    expect(result.items.some((a) => !a.published)).toBe(true);
  });

  it("creates an article with a slug and draft default", async () => {
    const article = await newsService.create(
      { title: "New Recycling Program Launch", summary: "Curbside recycling expands citywide.", content: "The city is expanding recycling to all districts.", category: "GENERAL" },
      admin,
    );
    expect(article.slug.startsWith("new-recycling-program-launch")).toBe(true);
    expect(article.published).toBe(false);
    expect(article.publishedAt).toBeNull();
    expect(article.authorName).toBe("System Admin");
  });

  it("sets publishedAt when created published", async () => {
    const article = await newsService.create(
      { title: "Immediate Announcement", summary: "An urgent notice.", content: "Important operational notice for all residents.", category: "GENERAL", published: true },
      admin,
    );
    expect(article.published).toBe(true);
    expect(article.publishedAt).toBeTruthy();
  });

  it("allows reading published articles by any user", async () => {
    const article = await newsService.getById("nws_seed_001", citizen);
    expect(article.title).toContain("Central Park");
  });

  it("blocks citizens from reading drafts", async () => {
    await expect(newsService.getById("nws_seed_003", citizen)).rejects.toThrow("not published");
  });

  it("allows staff to read drafts", async () => {
    const article = await newsService.getById("nws_seed_003", admin);
    expect(article.published).toBe(false);
  });

  it("publishes a draft via update", async () => {
    const updated = await newsService.update("nws_seed_003", { published: true });
    expect(updated.published).toBe(true);
    expect(updated.publishedAt).toBeTruthy();
  });

  it("unpublishes and clears publishedAt", async () => {
    const updated = await newsService.update("nws_seed_001", { published: false });
    expect(updated.published).toBe(false);
    expect(updated.publishedAt).toBeNull();
  });

  it("deletes an article", async () => {
    await newsService.remove("nws_seed_004");
    await expect(newsService.getById("nws_seed_004", admin)).rejects.toThrow("not found");
  });

  it("aggregates article statistics", async () => {
    const stats = await newsService.stats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.published).toBeGreaterThan(0);
    expect(stats.drafts).toBeGreaterThan(0);
    expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0);
    expect(stats.lastPublishedAt).toBeTruthy();
  });
});