import { test, expect } from "@playwright/test";

test.describe("Public pages render without error", () => {
  const cases: Array<{ path: string; heading: RegExp }> = [
    { path: "/about", heading: /About|Municipal/i },
    { path: "/emergency", heading: /Emergency/i },
  ];

  for (const { path, heading } of cases) {
    test(`${path} renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response).not.toBeNull();
      await expect(page.getByRole("heading", { name: heading, exact: false }).first()).toBeVisible();
    });
  }

  test("forgot-password page renders", async ({ page }) => {
    const response = await page.goto("/auth/forgot-password");
    expect(response).not.toBeNull();
    await expect(page.getByRole("heading", { name: /Forgot Password/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Send Reset Link/i })).toBeVisible();
  });

  test("register page exposes citizen sign-up fields", async ({ page }) => {
    const response = await page.goto("/register");
    expect(response).not.toBeNull();
    await expect(page.getByText("Create Your Account")).toBeVisible();
    expect(await page.locator("input").count()).toBeGreaterThan(2);
  });
});

test.describe("Cross-page navigation from the landing page", () => {
  test("primary nav hash links scroll to anchors on the landing page", async ({ page }) => {
    await page.goto("/");
    for (const text of ["Services", "Live Metrics", "Portals"]) {
      await page.getByRole("link", { name: text, exact: true }).first().click();
      await page.waitForLoadState("domcontentloaded");
      expect(new URL(page.url()).pathname).toBe("/");
    }
  });

  test("Sign In and Emergency SOS navigate to their routes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Sign In/i }).click();
    await page.waitForURL("**/login", { timeout: 20_000 });

    await page.goto("/");
    await page.getByRole("link", { name: /Emergency SOS/i }).click();
    await page.waitForURL("**/emergency", { timeout: 20_000 });
  });
});