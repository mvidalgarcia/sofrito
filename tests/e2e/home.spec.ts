import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/es");
  });

  test("loads with correct title and subtitle", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sofrito" })).toBeVisible();
    await expect(page.getByText("Encuentra la receta perfecta")).toBeVisible();
  });

  test("toggles between search modes", async ({ page }) => {
    const byNameBtn = page.getByRole("button", { name: "Buscar por nombre" });
    const byIngredientsBtn = page.getByRole("button", { name: "Buscar por ingredientes" });

    await expect(byNameBtn).toBeVisible();
    await expect(byIngredientsBtn).toBeVisible();

    await byIngredientsBtn.click();
    const addInput = page.getByPlaceholder("Añade un ingrediente");
    await expect(addInput).toBeVisible();

    await byNameBtn.click();
    const searchInput = page.getByPlaceholder("¿Qué quieres cocinar hoy?");
    await expect(searchInput).toBeVisible();
  });

  test("shows servings input in name mode", async ({ page }) => {
    await expect(page.getByText("Porciones")).toBeVisible();
    await expect(page.getByText("4")).toBeVisible();
  });

  test("navigates to my recipes page", async ({ page }) => {
    await page.getByRole("link", { name: "Mis recetas" }).click();
    await expect(page).toHaveURL(/\/es\/recipes/);
  });
});
