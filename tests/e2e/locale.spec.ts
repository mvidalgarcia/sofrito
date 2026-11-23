import { test, expect } from "@playwright/test";

// A browser set to English, using the app in Spanish.
test.use({ locale: "en-GB" });

test.describe("Language stays put while navigating", () => {
  test.beforeEach(async ({ request }) => {
    const reset = await request.delete("/api/test/recipes");
    expect(reset.status()).toBe(204);
    const created = await request.post("/api/saved-recipes", {
      data: {
        name: "Tortilla de patatas",
        servings: 4,
        prepTime: "10 min",
        cookTime: "25 min",
        ingredients: [{ amount: "4", item: "huevos" }],
        steps: ["Batir los huevos."],
        status: "saved",
        source: "manual",
        locale: "es",
      },
    });
    expect(created.ok()).toBeTruthy();
  });

  test("in-app links keep Spanish even without the language cookie", async ({ page, context }) => {
    await page.goto("/es");
    await expect(page.getByRole("heading", { name: "¿Qué hay en tu cocina?" })).toBeVisible();

    // Simulate a new browser session (or a restarted PWA): the cookie is gone,
    // so a link without the locale prefix would fall back to the browser's English.
    await context.clearCookies();

    await page.getByRole("link", { name: "Mis recetas" }).first().click();
    await expect(page).toHaveURL(/\/es\/recipes$/);
    await expect(page.getByRole("heading", { name: "Mis recetas" })).toBeVisible();

    await page.getByRole("link", { name: "Tortilla de patatas" }).click();
    await expect(page).toHaveURL(/\/es\/recipe\?id=/);
    await expect(page.getByRole("button", { name: "Guardada" })).toBeVisible();

    await page.getByRole("link", { name: "sofrito" }).first().click();
    await expect(page).toHaveURL(/\/es$/);
    await expect(page.getByRole("heading", { name: "¿Qué hay en tu cocina?" })).toBeVisible();
  });

  test("the language cookie outlives the browser session", async ({ page, context }) => {
    await page.goto("/es");
    const cookie = (await context.cookies()).find((c) => c.name === "NEXT_LOCALE");
    expect(cookie?.value).toBe("es");
    // -1 means a session cookie, which is lost when the browser or PWA closes.
    expect(cookie?.expires).toBeGreaterThan(Date.now() / 1000 + 300 * 24 * 60 * 60);
  });
});
