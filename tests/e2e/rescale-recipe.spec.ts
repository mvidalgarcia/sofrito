import { test, expect } from "@playwright/test";

test.describe("Rescale saved recipe", () => {
  test.beforeEach(async ({ request }) => {
    const reset = await request.delete("/api/test/recipes");
    expect(reset.status()).toBe(204);
  });

  test("scales parseable amounts and leaves approximate amounts unchanged", async ({ page }) => {
    await page.goto("/en/recipe/new");

    await page.getByPlaceholder("e.g. Chicken Tikka Masala").fill("Rescale test recipe");
    await page.getByPlaceholder("e.g. 15 min").fill("5 min");
    await page.getByPlaceholder("e.g. 30 min").fill("10 min");

    await page.getByPlaceholder("Amount").first().fill("2 cups");
    await page.getByPlaceholder("Ingredient").first().fill("flour");
    await page.getByRole("button", { name: /^\+ Add$/ }).click();
    await page.getByPlaceholder("Amount").nth(1).fill("a pinch");
    await page.getByPlaceholder("Ingredient").nth(1).fill("salt");

    await page.getByPlaceholder("Describe this step...").fill("Mix and cook.");
    await page.getByRole("button", { name: "Save recipe" }).click();
    await expect(page.getByText("Recipe saved!")).toBeVisible();

    await page.getByRole("link", { name: "View my recipes" }).click();
    await page.getByRole("link", { name: "Rescale test recipe" }).click();

    await expect(page.getByTestId("display-servings")).toHaveText("4");
    await expect(page.getByText("2 cups flour")).toBeVisible();
    await expect(page.getByText("a pinch salt")).toBeVisible();

    await page.getByTestId("increase-servings").click();
    await page.getByTestId("increase-servings").click();
    await page.getByTestId("increase-servings").click();
    await page.getByTestId("increase-servings").click();

    await expect(page.getByTestId("display-servings")).toHaveText("8");
    await expect(page.getByText("4 cups flour")).toBeVisible();
    await expect(page.getByText("~ a pinch salt")).toBeVisible();
  });
});
