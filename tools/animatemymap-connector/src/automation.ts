import { chromium, type BrowserContext, type Page } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import type { MapVideoPlan } from "./types.js";

const baseUrl = process.env.ANIMATEMYMAP_URL ?? "https://animatemymap.com/";
const profile = path.resolve(process.env.ANIMATEMYMAP_PROFILE ?? "./.browser-profile");
const headless = (process.env.ANIMATEMYMAP_HEADLESS ?? "false") === "true";

let context: BrowserContext | null = null;

async function getContext() {
  if (context) return context;
  context = await chromium.launchPersistentContext(profile, {
    headless,
    viewport: { width: 1440, height: 1000 },
    args: ["--disable-blink-features=AutomationControlled"]
  });
  return context;
}

export async function openStudio() {
  const ctx = await getContext();
  const page = ctx.pages()[0] ?? await ctx.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  return { url: page.url(), title: await page.title() };
}

async function clickText(page: Page, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const candidate = page.getByText(pattern).first();
    if (await candidate.count()) {
      await candidate.click();
      return true;
    }
  }
  return false;
}

async function waitForStudio(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1000);
  const text = await page.locator("body").innerText();
  if (/sign in|log in|create an account/i.test(text)) {
    return { authenticated: false };
  }
  return { authenticated: true };
}

export async function importPlan(plan: MapVideoPlan) {
  const ctx = await getContext();
  const page = ctx.pages()[0] ?? await ctx.newPage();
  if (!page.url().startsWith("https://animatemymap.com")) await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  const auth = await waitForStudio(page);
  if (!auth.authenticated) {
    return {
      ok: false,
      needsLogin: true,
      message: "AnimateMyMap is open in the persistent browser profile. Complete login once, then run the import again."
    };
  }

  // AnimateMyMap advertises bulk JSON configuration import. We intentionally
  // keep the browser interaction isolated here so UI changes only require
  // updating this adapter rather than the MCP contract.
  const json = JSON.stringify(plan, null, 2);
  const tmp = path.join(profile, "worldforge-animatemymap-plan.json");
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(tmp, json, "utf8");

  const imported = await clickText(page, [/import/i, /json/i, /bulk/i]);
  if (!imported) {
    return {
      ok: false,
      needsAdapterUpdate: true,
      planPath: tmp,
      message: "The current UI did not expose an Import/JSON/Bulk control by accessible text. The plan was written to the persistent browser profile so the adapter can be updated without losing the generated timeline."
    };
  }

  const inputs = page.locator('input[type="file"]');
  if (await inputs.count()) {
    await inputs.first().setInputFiles(tmp);
  } else {
    return {
      ok: false,
      needsAdapterUpdate: true,
      planPath: tmp,
      message: "Import control found, but no file input was exposed. The JSON plan is ready for the adapter's import step."
    };
  }

  await page.waitForTimeout(1500);
  return { ok: true, url: page.url(), planPath: tmp };
}

export async function renderVideo() {
  const ctx = await getContext();
  const page = ctx.pages()[0];
  if (!page) throw new Error("Open the AnimateMyMap studio first.");

  const clicked = await clickText(page, [/record/i, /render/i, /export/i, /download mp4/i]);
  if (!clicked) {
    return { ok: false, message: "No Render/Record/Export control was exposed by accessible text." };
  }

  await page.waitForTimeout(1000);
  return { ok: true, url: page.url() };
}
