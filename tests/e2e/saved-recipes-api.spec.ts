import { expect, test } from "@playwright/test";

const recipePayload = {
  name: "Shared name",
  ingredients: [{ item: "rice", amount: "1 cup" }],
  steps: ["Cook the rice."],
  servings: 2,
  prepTime: "5 min",
  cookTime: "15 min",
  source: "manual",
  status: "saved",
} as const;

test.describe("Saved recipes API", () => {
  test.beforeEach(async ({ request }) => {
    const reset = await request.delete("/api/test/recipes");
    expect(reset.status()).toBe(204);
  });

  test("allows duplicate names while assigning unique UUIDs", async ({ request }) => {
    const firstResponse = await request.post("/api/saved-recipes", { data: recipePayload });
    const secondResponse = await request.post("/api/saved-recipes", { data: recipePayload });

    expect(firstResponse.status()).toBe(201);
    expect(secondResponse.status()).toBe(201);

    const first = (await firstResponse.json()) as { id: string };
    const second = (await secondResponse.json()) as { id: string };
    expect(first.id).not.toBe(second.id);
    expect(first.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(second.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    const list = (await (await request.get("/api/saved-recipes")).json()) as unknown[];
    expect(list).toHaveLength(2);
  });

  test("updates and deletes a recipe", async ({ request }) => {
    const created = (await (
      await request.post("/api/saved-recipes", { data: recipePayload })
    ).json()) as { id: string };

    const updateResponse = await request.patch(`/api/saved-recipes/${created.id}`, {
      data: { name: "Updated recipe", status: "made" },
    });
    expect(updateResponse.ok()).toBe(true);
    await expect(updateResponse.json()).resolves.toMatchObject({
      id: created.id,
      name: "Updated recipe",
      status: "made",
    });

    expect((await request.delete(`/api/saved-recipes/${created.id}`)).status()).toBe(204);
    expect((await request.get(`/api/saved-recipes/${created.id}`)).status()).toBe(404);
  });

  test("isolates recipes by authenticated email", async ({ request }) => {
    const created = (await (
      await request.post("/api/saved-recipes", { data: recipePayload })
    ).json()) as { id: string };
    const otherUserHeaders = { "x-e2e-user-email": "other@sofrito.test" };

    const otherList = (await (
      await request.get("/api/saved-recipes", { headers: otherUserHeaders })
    ).json()) as unknown[];
    expect(otherList).toEqual([]);
    expect(
      (
        await request.get(`/api/saved-recipes/${created.id}`, {
          headers: otherUserHeaders,
        })
      ).status(),
    ).toBe(404);
  });

  test("shows the same recipes in separate browser contexts", async ({ browser, request }) => {
    await request.post("/api/saved-recipes", {
      data: { ...recipePayload, name: "Cross-device risotto" },
    });

    const desktopContext = await browser.newContext();
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const desktopPage = await desktopContext.newPage();
    const mobilePage = await mobileContext.newPage();

    await Promise.all([desktopPage.goto("/en/recipes"), mobilePage.goto("/en/recipes")]);
    await expect(desktopPage.getByText("Cross-device risotto")).toBeVisible();
    await expect(mobilePage.getByText("Cross-device risotto")).toBeVisible();

    await Promise.all([desktopContext.close(), mobileContext.close()]);
  });

  test("rejects unauthenticated requests", async ({ request }) => {
    const response = await request.get("/api/saved-recipes", {
      headers: { "x-e2e-unauthenticated": "true" },
    });
    expect(response.status()).toBe(401);
  });
});
