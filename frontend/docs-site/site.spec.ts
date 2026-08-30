import { expect, test, type Locator, type Page } from "@playwright/test";


const routes = ["/", "/guide/", "/docs/", "/docs/usage/searching/"];


function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}


function luminance([red, green, blue]: [number, number, number]): number {
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}


function ratio(foreground: [number, number, number], background: [number, number, number]): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}


function parseOpaqueColor(value: string): [number, number, number] {
  const match = value.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)(?:\D+([\d.]+))?\s*\)$/);
  if (!match) throw new Error(`unsupported computed color: ${value}`);
  if (match[4] !== undefined && Number(match[4]) !== 1) {
    throw new Error(`contrast sample is not fully opaque: ${value}`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}


async function computedColors(locator: Locator): Promise<{ foreground: string; background: string }> {
  return locator.evaluate((element) => {
    const foreground = getComputedStyle(element).color;
    let current: Element | null = element;
    while (current) {
      const background = getComputedStyle(current).backgroundColor;
      const alpha = background.match(/[\d.]+\)$/)?.[0].slice(0, -1);
      if (!background.startsWith("rgba") || alpha === "1") return { foreground, background };
      current = current.parentElement;
    }
    throw new Error("no opaque background found");
  });
}


async function expectContrast(locator: Locator, minimum: number): Promise<void> {
  const colors = await computedColors(locator);
  expect(ratio(parseOpaqueColor(colors.foreground), parseOpaqueColor(colors.background))).toBeGreaterThanOrEqual(minimum);
}


test("publishes each tier with semantic page landmarks", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation").first()).toBeVisible();
  }
});


test("supports keyboard navigation and returns focus after the image dialog", async ({ browserName, page }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Tab");
  if (browserName === "webkit") {
    await expect(page.getByLabel("Download a release archive")).toBeFocused();
  } else {
    await expect(page.locator(".wordmark")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Guide", exact: true }),
    ).toBeFocused();
  }

  const trigger = page.getByRole("link", { name: /synthetic technical document collection/i });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close image" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});


test("resolves release downloads only after interaction and keeps a stable fallback", async ({ page }) => {
  let releaseRequests = 0;
  await page.route("https://api.github.com/repos/kenn-io/docbank/releases/latest", async (route) => {
    releaseRequests += 1;
    await route.fulfill({ status: 503, body: "unavailable" });
  });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "open all releases" })).toBeVisible();
  expect(releaseRequests).toBe(0);

  await page.getByRole("button", { name: "Find archive" }).click();
  const status = page.locator("[data-release-status]");
  await expect(status).toContainText("could not be resolved");
  await expect(status.getByRole("link", { name: "Open all releases" })).toBeVisible();
  expect(releaseRequests).toBe(1);
});


test("keeps primary navigation usable at a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation.getByRole("link", { name: "Guide" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Docs" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "GitHub" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});


test("honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect.poll(() => page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
  const duration = await page.getByRole("link", { name: "Install for macOS or Linux" }).evaluate(
    (element) => getComputedStyle(element).transitionDuration,
  );
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});


test("gives every rendered image accessible text", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const images = page.locator("img");
    for (let index = 0; index < await images.count(); index += 1) {
      expect((await images.nth(index).getAttribute("alt"))?.trim(), `${route} image ${index}`).toBeTruthy();
    }
  }
});


test("keeps representative text and controls above contrast thresholds", async ({ page }) => {
  await page.goto("/");
  await expectContrast(page.getByRole("heading", { level: 1 }), 3);
  await expectContrast(page.locator(".lede").first(), 4.5);
  await expectContrast(page.getByRole("link", { name: "Guide" }).first(), 4.5);
  await expectContrast(page.getByRole("link", { name: "Install for macOS or Linux" }), 4.5);

  const platform = page.getByLabel("Download a release archive");
  await platform.focus();
  const focus = await platform.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outlineColor, background: style.backgroundColor };
  });
  expect(ratio(parseOpaqueColor(focus.outline), parseOpaqueColor(focus.background))).toBeGreaterThanOrEqual(3);

  await page.goto("/docs/");
  await expectContrast(page.locator(".md-typeset p").first(), 4.5);
  await expectContrast(page.locator(".md-typeset a").first(), 4.5);
});
