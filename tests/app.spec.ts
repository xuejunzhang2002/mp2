import { test, expect, type Page } from "@playwright/test";

// Deterministic API responses let the interaction suite run without network access.
const names = [
  "bulbasaur",
  "ivysaur",
  "venusaur",
  "charmander",
  "charmeleon",
  "charizard",
];
const fixture = (id: number) => ({
  id,
  name:
    names[id - 1] ||
    (id === 25 ? "pikachu" : id === 151 ? "mew" : `pokemon-${id}`),
  height: 10 + id,
  weight: 200 - id,
  types: [
    { type: { name: id <= 3 ? "grass" : id <= 6 ? "fire" : "electric" } },
  ],
  abilities: [{ ability: { name: "overgrow" }, is_hidden: false }],
  stats: [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ].map((name) => ({ base_stat: 45 + id, stat: { name } })),
  sprites: {
    front_default: null,
    other: { "official-artwork": { front_default: null } },
  },
});
async function mockApi(page: Page) {
  await page.route("https://pokeapi.co/api/v2/pokemon/*", (route) =>
    route.fulfill({
      json: fixture(Number(route.request().url().split("/").pop())),
    }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("live search, number search, empty state, and reset", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".pokemon-row")).toHaveCount(151);
  const search = page.getByRole("textbox", { name: "Search Pokémon" });
  await search.fill("saur");
  await expect(page.locator(".pokemon-row")).toHaveCount(3);
  await search.fill("#025");
  await expect(page.locator(".pokemon-row")).toHaveCount(1);
  await expect(page.locator(".pokemon-row")).toContainText("Pikachu");
  await search.fill("not-a-pokemon");
  await expect(page.getByText("No Pokémon found")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".pokemon-row")).toHaveCount(151);
});

test("all sort properties support both directions", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".pokemon-row")).toHaveCount(151);
  for (const key of ["id", "name", "weight", "height", "stats"]) {
    await page.getByLabel("Sort by", { exact: true }).selectOption(key);
    for (const desc of [false, true]) {
      if (desc)
        await page
          .getByRole("button", { name: "Sort descending", exact: true })
          .click();
      const actual = await page
        .locator(".pokemon-row")
        .evaluateAll((rows) =>
          rows.map((row) => Number(row.getAttribute("href")!.split("/").pop())),
        );
      const sorted = Array.from({ length: 151 }, (_, i) => fixture(i + 1))
        .sort((a, b) => {
          const difference =
            key === "name"
              ? a.name.localeCompare(b.name)
              : key === "weight"
                ? a.weight - b.weight
                : a.id - b.id;
          return difference * (desc ? -1 : 1);
        })
        .map((p) => p.id);
      expect(actual).toEqual(sorted);
    }
    await page
      .getByRole("button", { name: "Sort ascending", exact: true })
      .click();
  }
});

test("gallery multi-select filters, details, sequence, and preserved return state", async ({
  page,
}) => {
  await page.goto("gallery");
  await page.getByRole("button", { name: "Grass", exact: true }).click();
  await expect(page.locator(".pokemon-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Fire", exact: true }).click();
  await expect(page.locator(".pokemon-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Grass", exact: true }).click();
  await expect(page.locator(".pokemon-card")).toHaveCount(3);
  await page.locator(".pokemon-card").first().click();
  await expect(page).toHaveURL(/pokemon\/4$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Charmander",
  );
  await expect(page.getByRole("meter")).toHaveCount(6);
  await page.getByRole("link", { name: /Next Pokémon/ }).click();
  await expect(page).toHaveURL(/pokemon\/5$/);
  await page.getByRole("link", { name: /Previous Pokémon/ }).click();
  await expect(page).toHaveURL(/pokemon\/4$/);
  await page.getByRole("link", { name: /Previous Pokémon/ }).click();
  await expect(page).toHaveURL(/pokemon\/6$/);
  await page.getByRole("link", { name: /Back to discoveries/ }).click();
  await expect(page).toHaveURL(/gallery\?type=fire$/);
  await expect(page.locator(".pokemon-card")).toHaveCount(3);
});

test("list detail navigation, direct links, reload, wraparound and missing routes", async ({
  page,
}) => {
  await page.goto("./?q=saur&sort=name&order=desc");
  await page.locator(".pokemon-row").first().click();
  await expect(page).toHaveURL(/pokemon\/3$/);
  await page.getByRole("link", { name: /Next Pokémon/ }).click();
  await expect(page).toHaveURL(/pokemon\/2$/);
  await page.goto("pokemon/1");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bulbasaur");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bulbasaur");
  await page.getByRole("link", { name: /Previous Pokémon/ }).click();
  await expect(page).toHaveURL(/pokemon\/151$/);
  await page.getByRole("link", { name: /Next Pokémon/ }).click();
  await expect(page).toHaveURL(/pokemon\/1$/);
  await page.goto("pokemon/999");
  await expect(
    page.getByRole("heading", { name: "Off the map." }),
  ).toBeVisible();
});

test("API failure can be retried and successful data is cached", async ({
  page,
}) => {
  await page.route("https://pokeapi.co/api/v2/pokemon/*", (route) =>
    route.abort(),
  );
  await page.goto("./");
  await expect(page.getByRole("alert")).toContainText("couldn’t load");
  await page.unroute("https://pokeapi.co/api/v2/pokemon/*");
  await mockApi(page);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".pokemon-row")).toHaveCount(151);
  await page.route("https://pokeapi.co/api/v2/pokemon/*", (route) =>
    route.abort(),
  );
  await page.reload();
  await expect(page.locator(".pokemon-row")).toHaveCount(151);
});

test("mobile list, gallery and detail fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["./", "gallery", "pokemon/25"]) {
    await page.goto(path);
    await expect(page.locator(".page-content")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(375);
  }
});
