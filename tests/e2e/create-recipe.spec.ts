import { test, expect } from "@playwright/test";

test.describe("Create recipe manually", () => {
  test.beforeEach(async ({ page, request }) => {
    await request.delete("/api/test/recipes");
    await page.goto("/en");
  });

  test("navigates to the new recipe form", async ({ page }) => {
    await page.getByRole("link", { name: "New recipe" }).click();
    await expect(page).toHaveURL(/\/(en|es)\/recipe\/new/);
    await expect(page.getByRole("heading", { name: "Create a recipe" })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/en/recipe/new");
    await page.getByRole("button", { name: "Save recipe" }).click();

    await expect(page.getByText("This field is required")).toBeVisible();
    await expect(page.getByText("Add at least one ingredient")).toBeVisible();
    await expect(page.getByText("Add at least one step")).toBeVisible();
  });

  test("creates a recipe and sees it in the list", async ({ page }) => {
    await page.goto("/en/recipe/new");

    await page.getByPlaceholder("e.g. Chicken Tikka Masala").fill("Spanish omelette");
    await page.getByPlaceholder("e.g. 15 min").fill("10 min");
    await page.getByPlaceholder("e.g. 30 min").fill("20 min");

    const amountInputs = page.getByPlaceholder("Amount");
    const itemInputs = page.getByPlaceholder("Ingredient");

    await amountInputs.first().fill("4");
    await itemInputs.first().fill("eggs");
    await page.getByRole("button", { name: /^\+ Add$/ }).click();
    await amountInputs.nth(1).fill("2");
    await itemInputs.nth(1).fill("potatoes");
    await page.getByRole("button", { name: /^\+ Add$/ }).click();
    await amountInputs.nth(2).fill("1");
    await itemInputs.nth(2).fill("onion");

    await page
      .getByPlaceholder("Describe this step...")
      .fill("Peel and slice the potatoes thinly.");
    await page.getByRole("button", { name: "+ Add step" }).click();
    await page
      .getByPlaceholder("Describe this step...")
      .nth(1)
      .fill("Beat the eggs and mix with the potatoes.");
    await page.getByRole("button", { name: "+ Add step" }).click();
    await page.getByPlaceholder("Describe this step...").nth(2).fill("Fry in hot oil until set.");

    await page.getByRole("button", { name: "Save recipe" }).click();

    await expect(page.getByText("Recipe saved!")).toBeVisible();

    await page.getByRole("link", { name: "View my recipes" }).click();
    await expect(page).toHaveURL(/\/(en|es)\/recipes/);
    await expect(page.getByText("Spanish omelette")).toBeVisible();
  });

  test("create another resets the form", async ({ page }) => {
    await page.goto("/en/recipe/new");
    await page.getByPlaceholder("e.g. Chicken Tikka Masala").fill("Salad");
    await page.getByPlaceholder("Amount").first().fill("1");
    await page.getByPlaceholder("Ingredient").first().fill("lettuce");
    await page.getByPlaceholder("Describe this step...").fill("Wash and chop.");
    await page.getByRole("button", { name: "Save recipe" }).click();

    await expect(page.getByText("Recipe saved!")).toBeVisible();

    await page.getByRole("button", { name: "Create another" }).click();
    await expect(page.getByRole("heading", { name: "Create a recipe" })).toBeVisible();
    const nameInput = page.getByPlaceholder("e.g. Chicken Tikka Masala");
    await expect(nameInput).toBeEmpty();
  });
});
