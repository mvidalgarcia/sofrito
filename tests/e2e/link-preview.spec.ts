import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const recipe = {
  name: "Garbanzos con espinacas",
  servings: 6,
  prepTime: "20 min",
  cookTime: "1 h",
  ingredients: [{ amount: "400 g", item: "chickpeas" }],
  steps: ["Simmer everything together."],
  source: "llm",
};

async function share(request: APIRequestContext): Promise<string> {
  const response = await request.post("/api/share", { data: recipe });
  expect(response.ok()).toBe(true);
  return ((await response.json()) as { id: string }).id;
}

/** Parses the server's HTML without running it, as link preview fetchers do. */
async function readHead(page: Page, path: string) {
  const response = await page.request.get(path, { headers: { "User-Agent": "TelegramBot" } });
  expect(response.status()).toBe(200);
  const html = await response.text();
  return page.evaluate((source) => {
    const head = new DOMParser().parseFromString(source, "text/html").head;
    return Object.fromEntries(
      [...head.querySelectorAll("meta[property], meta[name]")].map((meta) => [
        meta.getAttribute("property") ?? meta.getAttribute("name"),
        meta.getAttribute("content") ?? "",
      ]),
    );
  }, html);
}

async function expectCard(request: APIRequestContext, url: string) {
  const response = await request.get(url);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  const png = await response.body();
  // Width and height sit at fixed offsets in the PNG header.
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  expect(png.byteLength).toBeLessThan(600 * 1024);
  return png;
}

test.describe("Link previews", () => {
  test("describes a shared recipe in the server HTML", async ({ page, request }) => {
    const id = await share(request);
    const meta = await readHead(page, `/en/share?id=${id}`);

    expect(meta["og:title"]).toBe(recipe.name);
    expect(meta["og:description"]).toBe("20 min prep · 1 h cook · serves 6. Shared from Sofrito.");
    expect(meta["og:image"]).toMatch(new RegExp(`^https?://[^/]+/api/og\\?id=${id}&locale=en$`));
    expect(meta["twitter:card"]).toBe("summary_large_image");
  });

  test("uses the language of the page", async ({ page, request }) => {
    const id = await share(request);
    const meta = await readHead(page, `/es/share?id=${id}`);

    expect(meta["og:description"]).toBe(
      "20 min de preparación · 1 h de cocción · para 6. Compartida desde Sofrito.",
    );
  });

  test("falls back to generic metadata for an unknown id", async ({ page }) => {
    const meta = await readHead(page, "/en/share?id=nope00");

    expect(meta["og:title"]).toBe("Sofrito");
    expect(meta["og:description"]).toBe("A recipe shared from Sofrito.");
    expect(meta["og:image"]).toMatch(/\/api\/og\?locale=en$/);
  });

  test("renders a card for a recipe and a generic one otherwise", async ({ request }) => {
    const id = await share(request);
    const card = await expectCard(request, `/api/og?id=${id}&locale=en`);
    const unknown = await expectCard(request, "/api/og?id=nope00&locale=en");
    const missing = await expectCard(request, "/api/og?locale=en");

    expect(card.equals(unknown)).toBe(false);
    expect(unknown.equals(missing)).toBe(true);
  });
});
