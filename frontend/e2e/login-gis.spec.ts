import { test, expect } from "@playwright/test";

test.describe("Super Admin flow", () => {
  test("login as Super Admin and open the GIS portal", async ({ page }) => {
    await page.goto("/login");

    // Pick the Super Admin role — the form autofills its demo credentials.
    await page.getByRole("button", { name: /Super Admin/ }).click();
    await expect(page.locator("#email-input")).toHaveValue("superadmin@smartcity.gov");

    await page.getByRole("button", { name: "Login", exact: true }).click();

    // Should land on the admin dashboard (middleware sees the session cookie).
    await page.waitForURL("**/admin/dashboard", { timeout: 20_000 });
    await expect(page.getByText(/Super Admin Dashboard/)).toBeVisible();

    // Admin sidebar exposes the GIS Portal entry.
    const gisLink = page.getByRole("link", { name: /GIS Portal/ });
    await expect(gisLink).toBeVisible();
    await gisLink.click();
    await page.waitForURL("**/admin/gis");

    // GIS portal shell renders.
    await expect(page.getByRole("heading", { name: /GIS Portal/ })).toBeVisible();
    await expect(page.getByText("Dynamic Filters")).toBeVisible({ timeout: 20_000 });

    // Bottom stats bar present.
    let statVisible = false;
    for (const label of ["Active Complaints", "Public Assets", "Emergency Cases", "Gov. Facilities"]) {
      if (await page.getByText(label, { exact: true }).first().isVisible().catch(() => false)) {
        statVisible = true;
        break;
      }
    }
    expect(statVisible).toBe(true);
  });
});

test.describe("Login form behavior", () => {
  test("role selection swaps demo credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: /Citizen/ }).click();
    await expect(page.locator("#email-input")).toHaveValue("citizen@smartcity.gov");

    await page.getByRole("button", { name: /Department Head/ }).click();
    await expect(page.locator("#email-input")).toHaveValue("head@publicworks.gov");
  });
});