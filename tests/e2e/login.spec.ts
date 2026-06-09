import { test, expect } from "@playwright/test";

test.describe("Login page (smoke)", () => {
  test("renders the login card with sign-in button", async ({ page }) => {
    await page.goto("/es/login");
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar sesión con Google" })).toBeVisible();
  });
});
