// Regenerates the screenshots in docs/screenshots/ used by the README.
//
// Start the app in E2E mode first (in-memory recipes, no auth, no LLM key needed):
//   E2E_TEST=true RECIPE_REPOSITORY=memory pnpm exec next dev --port 3123
// then run:
//   pnpm run screenshots   (or BASE_URL=... to point at another port)
//
// LLM responses are stubbed, so the output is deterministic.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL || "http://localhost:3123";
const outDir = process.env.OUT_DIR || "docs/screenshots";
const locale = process.env.LOCALE || "en";

const paella = {
  name: "Paella Valenciana",
  servings: 4,
  prepTime: "20 min",
  cookTime: "40 min",
  ingredients: [
    { amount: "300 g", item: "bomba rice" },
    { amount: "400 g", item: "chicken thighs, in pieces" },
    { amount: "250 g", item: "rabbit, in pieces" },
    { amount: "150 g", item: "flat green beans" },
    { amount: "100 g", item: "garrofó (butter beans)" },
    { amount: "1", item: "ripe tomato, grated" },
    { amount: "1 tsp", item: "sweet smoked paprika" },
    { amount: "a pinch", item: "saffron threads" },
    { amount: "60 ml", item: "extra virgin olive oil" },
    { amount: "1 l", item: "water" },
  ],
  steps: [
    "Heat the oil in a wide paella pan and brown the chicken and rabbit with a pinch of salt.",
    "Add the green beans and garrofó and sauté for 3 minutes.",
    "Stir in the grated tomato and paprika and cook until jammy.",
    "Pour in the water with the saffron, bring to a boil and simmer for 20 minutes.",
    "Scatter the rice evenly and cook on medium heat for 18 minutes without stirring.",
    "Let it rest for 5 minutes, covered with a clean towel, before serving.",
  ],
};

const saved = [
  paella,
  {
    name: "Tortilla de patatas",
    servings: 4,
    prepTime: "15 min",
    cookTime: "25 min",
    ingredients: [
      { amount: "6", item: "eggs" },
      { amount: "600 g", item: "potatoes" },
      { amount: "1", item: "onion" },
    ],
    steps: ["Confit the potatoes and onion.", "Mix with the eggs and set in the pan."],
    status: "made",
  },
  {
    name: "Gazpacho andaluz",
    servings: 6,
    prepTime: "15 min",
    cookTime: "0 min",
    ingredients: [
      { amount: "1 kg", item: "ripe tomatoes" },
      { amount: "1", item: "cucumber" },
      { amount: "1", item: "green pepper" },
    ],
    steps: ["Blend everything.", "Chill for at least 2 hours."],
  },
  {
    name: "Lentejas estofadas con chorizo",
    servings: 6,
    prepTime: "20 min",
    cookTime: "1 h",
    ingredients: [
      { amount: "400 g", item: "brown lentils" },
      { amount: "1", item: "chorizo, sliced" },
    ],
    steps: ["Soften the onion.", "Add the lentils and simmer until tender."],
    status: "made",
  },
  {
    name: "Pisto manchego",
    servings: 4,
    prepTime: "15 min",
    cookTime: "45 min",
    ingredients: [
      { amount: "2", item: "courgettes" },
      { amount: "2", item: "peppers" },
    ],
    steps: ["Sauté the vegetables slowly.", "Add tomato and reduce."],
  },
];

// Hides the Next.js dev-mode indicator so it doesn't show up in the shots.
const hideDevOverlay = "nextjs-portal { display: none !important; }";

async function seed(request) {
  const reset = await request.delete("/api/test/recipes");
  if (reset.status() !== 204) {
    throw new Error("Could not reset recipes. Is the server running with E2E_TEST=true?");
  }
  const ids = [];
  for (const recipe of [...saved].reverse()) {
    const res = await request.post("/api/saved-recipes", {
      data: { status: "saved", source: "llm", locale, ...recipe },
    });
    ids.unshift((await res.json()).id);
  }
  return ids;
}

async function newPage(browser, colorScheme, options = {}) {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme,
    serviceWorkers: "block",
    ...options,
  });
  const page = await context.newPage();
  await page.route("**/api/recipe", (route) => route.fulfill({ json: paella }));
  return page;
}

async function settle(page) {
  await page.addStyleTag({ content: hideDevOverlay });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function capture(browser, { name, colorScheme, run }) {
  const page = await newPage(browser, colorScheme);
  await run(page);
  await settle(page);
  const path = `${outDir}/${name}-${colorScheme}.png`;
  await page.screenshot({ path });
  console.log(`✓ ${path}`);
  await page.context().close();
}

// The header wordmark on a transparent background, for the top of the README.
async function captureLogo(browser, colorScheme) {
  const page = await newPage(browser, colorScheme, {
    viewport: { width: 600, height: 300 },
    deviceScaleFactor: 4,
    isMobile: false,
    hasTouch: false,
  });
  await page.goto(`/${locale}`);
  await settle(page);
  await page.addStyleTag({
    content: "*, *::before, *::after { background: transparent !important; }",
  });
  const path = `${outDir}/logo-${colorScheme}.png`;
  await page
    .getByRole("banner")
    .getByRole("link")
    .first()
    .screenshot({ path, omitBackground: true });
  console.log(`✓ ${path}`);
  await page.context().close();
}

async function searchPaella(page) {
  await page.goto(`/${locale}`);
  await page.locator("#dish").fill("Paella valenciana");
  await page.locator("form button[type=submit]").click();
  const heading = page.getByRole("heading", { name: paella.name });
  await heading.waitFor();
  // Start the shot at the AI disclaimer above the recipe card.
  await page
    .getByText(/not tested in a kitchen/)
    .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 24));
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const setup = await browser.newContext({ baseURL });
const [paellaId] = await seed(setup.request);
await setup.close();

const shots = [
  { name: "home", run: (p) => p.goto(`/${locale}`) },
  { name: "search-result", run: searchPaella },
  {
    name: "my-recipes",
    run: async (p) => {
      await p.goto(`/${locale}/recipes`);
      await p.getByText(paella.name).first().waitFor();
    },
  },
  {
    name: "recipe",
    run: async (p) => {
      await p.goto(`/${locale}/recipe?id=${paellaId}`);
      await p.getByRole("heading", { name: paella.name }).waitFor();
    },
  },
];

for (const colorScheme of ["light", "dark"]) {
  await captureLogo(browser, colorScheme);
  for (const shot of shots) {
    await capture(browser, { ...shot, colorScheme });
  }
}

await browser.close();
