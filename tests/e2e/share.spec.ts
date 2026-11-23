import { test, expect } from "@playwright/test";

const recipe = {
  name: "Lentejas estofadas con chorizo",
  servings: 6,
  prepTime: "20 min",
  cookTime: "1 h",
  ingredients: [
    { amount: "400 g", item: "brown lentils" },
    { amount: "1", item: "chorizo, sliced" },
  ],
  steps: ["Soften the onion.", "Add the lentils and simmer until tender."],
  source: "llm",
};

test.describe("Shared recipe (signed out)", () => {
  // The app's service worker would fetch /api/share itself, bypassing page.route.
  test.use({ serviceWorkers: "block" });

  test("shows the recipe and invites the visitor to sign in to keep it", async ({ page }) => {
    // The E2E server has no auth secret, so the session resolves as signed out.
    await page.route(/\/api\/share\?id=abc123$/, (route) => route.fulfill({ json: recipe }));
    await page.goto("/en/share?id=abc123");

    await expect(page.getByRole("heading", { name: recipe.name })).toBeVisible();
    await expect(page.getByText("brown lentils")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Keep this recipe" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Menu" })).toHaveCount(0);

    const signIn = page.getByRole("link", { name: "Save to my recipes" });
    await expect(signIn).toHaveAttribute(
      "href",
      `/en/login?callbackUrl=${encodeURIComponent("/en/share?id=abc123")}`,
    );
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });
});
