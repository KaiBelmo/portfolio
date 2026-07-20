import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __projectFilterMetrics: {
      gaps: number[];
      longTasks: number[];
    };
  }
}

test("project filter switches from All to Open source without long frame stalls", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("http://localhost:3000/projects", { waitUntil: "networkidle" });

  await page.evaluate(() => {
    window.__projectFilterMetrics = { gaps: [], longTasks: [] };

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__projectFilterMetrics.longTasks.push(entry.duration);
        }
      }).observe({ entryTypes: ["longtask"] });
    } catch {
      // Long task timing is not available in every browser engine.
    }

    let lastFrame = performance.now();

    function trackFrame(now: number) {
      window.__projectFilterMetrics.gaps.push(now - lastFrame);
      lastFrame = now;
      requestAnimationFrame(trackFrame);
    }

    requestAnimationFrame(trackFrame);
  });

  await page.getByRole("button", { name: /^Open source/ }).click();
  await expect(page.getByRole("button", { name: /^Open source/ })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.locator("article")).toHaveCount(2);
  await page.waitForTimeout(700);

  const metrics = await page.evaluate(() => {
    const gaps = window.__projectFilterMetrics.gaps;

    return {
      maxGap: Math.max(...gaps),
      longTasks: window.__projectFilterMetrics.longTasks,
    };
  });

  expect(metrics.maxGap).toBeLessThan(80);
  expect(metrics.longTasks.filter((duration) => duration > 80)).toEqual([]);
});
