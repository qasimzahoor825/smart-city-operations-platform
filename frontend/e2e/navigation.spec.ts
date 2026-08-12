import { test, expect } from "@playwright/test";

test.describe("Public pages render", () => {
  const cases: Array<{ path: string; contains: string }> = [
    { path: "/login", contains: "Login to Your Account" },
    { path: "/register", contains: "Create Your Account" },
    { path: "/services", contains: "Services" },
    { path: "/contact", contains: "Contact" },
    { path: "/news", contains: "News" },
  ];

  for (const { path, contains } of cases) {
    test(`${path} renders without error`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response).not.toBeNull();
      await expect(page.getByText(contains, { exact: false }).first()).toBeVisible();
    });
  }
});

test.describe("Protected routes redirect unauthenticated users to login", () => {
  for (const path of ["/admin/gis", "/admin/dashboard", "/citizen/dashboard", "/department/gis"]) {
    test(`${path} redirects to /login`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await page.waitForURL((url) => url.pathname === "/login");
      await expect(page.getByText("Login to Your Account")).toBeVisible();
    });
  }
});

test.describe("Failure handling", () => {
  test("login with invalid credentials shows an error, not a crash", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/Email|Email Address/i).fill("nobody@example.com");
    await page.getByLabel("Password", { exact: true }).fill("WrongPass123");
    await page.getByRole("button", { name: /Sign In|Login/i }).last().click();

    // Page must remain usable (no error boundary / blank screen).
    await expect(page.getByText("Login to Your Account")).toBeVisible();
  });
});