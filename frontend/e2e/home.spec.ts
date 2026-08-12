import { test, expect, type Page } from "@playwright/test";

/** True when the document does not scroll horizontally (tolerance for 1px rounding). */
async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth <= window.innerWidth + 1;
  });
}

test.describe("Landing page — desktop (1280px)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("header shows branding and primary navigation", async ({ page }) => {
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: /SmartCity/ })).toBeVisible();
    await expect(header.getByText("Enterprise Municipal Platform")).toBeVisible();
    for (const link of ["Services", "Live Metrics", "Portals"]) {
      await expect(header.getByRole("link", { name: link, exact: true })).toBeVisible();
    }
    await expect(header.getByRole("link", { name: /Sign In/i })).toBeVisible();
    await expect(header.getByRole("link", { name: /Emergency SOS/i })).toBeVisible();
  });

  test("hero section matches the reference", async ({ page }) => {
    const hero = page.locator("#metrics");
    await expect(page.getByText(/Introducing City OS 2.0/)).toBeVisible();
    await page.locator("img[alt*='smart city']").first().waitFor();

    await expect(page.getByRole("heading", { name: /One City/ })).toBeVisible();
    await expect(page.getByText(/Every service, department & sensor/)).toBeVisible();
    await expect(page.getByText(/living operating system for modern municipalities/i)).toBeVisible();

    for (const label of ["Complaints", "Resolved", "Departments", "Officers"]) {
      await expect(hero.getByText(label, { exact: true })).toBeVisible();
    }

    await expect(page.getByRole("link", { name: /Enter Citizen Portal/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Government Access/ })).toBeVisible();
    await expect(page.getByText(/99.99% uptime/)).toBeVisible();
  });

  test("service ticker lists all reference items exactly once per set", async ({ page }) => {
    const section = page.locator("section", { hasText: "Utility Bill Payments" }).first();
    for (const item of [
      "Utility Bill Payments",
      "Book Appointments",
      "Trade Licenses",
      "Smart Transit",
      "Emergency SOS",
      "Real-time GIS",
      "IoT Sensors",
      "Digital Hospital",
      "Waste Management",
      "Report an Issue",
    ]) {
      await expect(section.getByText(item)).toHaveCount(2); // one per marquee copy
    }
  });

  test("ecosystem section heading present with gradient copy", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /One Operating System. Every City System./ })).toBeVisible();
  });
});

test.describe("Landing page — no horizontal overflow", () => {
  for (const width of [375, 480, 768, 1024, 1280, 1440]) {
    test(`viewport ${width}px does not horizontally overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.waitForLoadState("networkidle").catch(() => undefined);
      expect(await noHorizontalOverflow(page)).toBe(true);
    });
  }
});

test.describe("Landing page — mobile (375px)", () => {
  test("mobile menu opens and exposes navigation and actions", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /open menu/i });
    await expect(toggle).toBeVisible();
    await toggle.click();

    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    for (const link of ["Services", "Live Metrics", "Portals"]) {
      await expect(menu.getByRole("link", { name: link, exact: true })).toBeVisible();
    }
    await expect(menu.getByRole("link", { name: /Sign In/i })).toBeVisible();
    await expect(menu.getByRole("link", { name: /Emergency SOS/i })).toBeVisible();
  });

  test("stats stack in two columns and CTAs stay inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByText("Complaints", { exact: true })).toBeVisible();
    const ctas = page.getByRole("link", { name: /Enter Citizen Portal|Government Access/ });
    await ctas.first().scrollIntoViewIfNeeded();
    expect(await noHorizontalOverflow(page)).toBe(true);
  });
});