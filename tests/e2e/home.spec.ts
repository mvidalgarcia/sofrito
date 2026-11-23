import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/es");
  });

  test("loads with the masthead and intro", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "¿Qué hay en tu cocina?" })).toBeVisible();
    await expect(page.getByText("Busca un plato o dinos qué tienes")).toBeVisible();
  });

  test("toggles between search modes", async ({ page }) => {
    const byNameBtn = page.getByRole("button", { name: "Por plato" });
    const byIngredientsBtn = page.getByRole("button", { name: "Por ingredientes" });

    await expect(byNameBtn).toBeVisible();
    await expect(byIngredientsBtn).toBeVisible();

    await byIngredientsBtn.click();
    const addInput = page.getByPlaceholder("Añade un ingrediente");
    await expect(addInput).toBeVisible();

    await byNameBtn.click();
    const searchInput = page.getByPlaceholder("¿Qué quieres cocinar hoy?");
    await expect(searchInput).toBeVisible();
  });

  test("shows servings input in name mode, defaulting to 2", async ({ page }) => {
    await expect(page.getByText("Porciones")).toBeVisible();
    await expect(page.getByRole("group", { name: "Porciones" })).toContainText("2");
  });

  test("navigates to my recipes page", async ({ page }) => {
    await page.getByRole("link", { name: "Mis recetas" }).click();
    await expect(page).toHaveURL(/\/es\/recipes/);
  });
});
