import { test, expect } from "@playwright/test";

const ROLE_CASES: Array<{
  name: string;
  roleLabel: string;
  email: string;
  landing: RegExp;
  heading: RegExp;
}> = [
  {
    name: "Citizen",
    roleLabel: "Citizen",
    email: "citizen@smartcity.gov",
    landing: /citizen\/dashboard/,
    heading: /Citizen Dashboard|Good Morning/i,
  },
  {
    name: "Department Head",
    roleLabel: "Department Head",
    email: "head@publicworks.gov",
    landing: /department\/dashboard/,
    heading: /Department|Dashboard/i,
  },
  {
    name: "Officer",
    roleLabel: "Officer",
    email: "officer@publicworks.gov",
    landing: /department\/officer/,
    heading: /Dashboard/i,
  },
  {
    name: "Super Admin",
    roleLabel: "Super Admin",
    email: "superadmin@smartcity.gov",
    landing: /admin\/dashboard/,
    heading: /Super Admin Dashboard/i,
  },
];

test.describe("Login → role-appropriate landing pages", () => {
  for (const { name, roleLabel, email, landing, heading } of ROLE_CASES) {
    test(`${name} lands on their role dashboard`, async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("button", { name: roleLabel, exact: true }).click();
      await expect(page.locator("#email-input")).toHaveValue(email);
      await page.getByRole("button", { name: "Login", exact: true }).click();

      await page.waitForURL((url) => landing.test(url.pathname), { timeout: 30_000 });
      await expect(page.getByRole("heading", { name: heading, exact: false }).first()).toBeVisible();
    });
  }

  test("Protected /admin/dashboard renders the admin shell after login", async ({ page }) => {
    await page.goto("/login?next=/admin/dashboard");
    await page.getByRole("button", { name: /Super Admin/ }).click();
    await page.getByRole("button", { name: "Login", exact: true }).click();

    await page.waitForURL("**/admin/dashboard", { timeout: 30_000 });
    await expect(page.getByRole("link", { name: /GIS Portal/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Users/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Departments/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Emergency/ })).toBeVisible();
  });
});