import { test, expect } from "@playwright/test";

test.describe("Login page (smoke)", () => {
  test("renders the login card with sign-in button", async ({ page }) => {
    await page.goto("/es/login");
    await expect(page.getByRole("heading", { name: "Cocina con lo que tienes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible();
  });
});
