import { chromium, type Browser, type Page } from "playwright";
import { scoreLink, type DiscoveredLink } from "../../utils/linkRanker.js";

export interface CrawledPage {
  url: string;
  title: string | null;
  content: string;
  links: DiscoveredLink[];
}

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    // Remove hash fragments
    url.hash = "";

    // Remove trailing slash except homepage
    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

function isSameDomain(startUrl: URL, targetUrl: string): boolean {
  try {
    const target = new URL(targetUrl);
    
    // Normalize both hostnames by removing 'www.' if present
    const startHost = startUrl.hostname.replace(/^www\./, "");
    const targetHost = target.hostname.replace(/^www\./, "");

    return targetHost === startHost;
  } catch {
    return false;
  }
}

export const WebsiteCrawlerService = {
  maxPages: 10, 
  maxDepth: 3,

  async crawl(startUrl: string) {
    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const start = new URL(startUrl);
      const visited = new Set<string>();
      const pages: CrawledPage[] = [];

      let queue: { url: string; score: number; depth: number }[] = [
        {
          url: start.href,
          score: 100,
          depth: 0,
        },
      ];

      while (queue.length > 0 && pages.length < this.maxPages) {
        const current = queue.shift()!;

        if (visited.has(current.url)) continue;

        visited.add(current.url);

        console.log(
          `Crawling: ${current.url} (score: ${current.score}, depth: ${current.depth})`,
        );

        const result = await this.crawlPage(browser, current.url);

        if (!result) {
          continue;
        }

        pages.push(result.page);

        if (current.depth < this.maxDepth) {
          const rankedLinks = result.links
            .filter((link) => isSameDomain(start, link.url))
            .map((link) => ({
              url: link.url,
              score: scoreLink(link),
              depth: current.depth + 1,
            }))
            .filter((link) => link.score > 0)
            .sort((a, b) => b.score - a.score);

          queue.push(...rankedLinks);
        }
        queue.sort((a, b) => b.score - a.score);
      }

      return pages;
    } catch (error) {
      console.error(`Failed: ${startUrl}`, error);
      return [];
    } finally {
      await browser.close();
    }
  },

  async crawlPage(
    browser: Browser,
    url: string,
  ): Promise<{ page: CrawledPage; links: DiscoveredLink[] } | null> {
    const page = await browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const rawLinks = await page.locator("a").evaluateAll((anchors) =>
        anchors
          .map((anchor) => ({
            url: (anchor as HTMLAnchorElement).href,
            text: (anchor.textContent || "").trim(),
          }))
          .filter((link) => link.url),
      );
 
      const title = await page.title();

      const content = await page.evaluate(() => {
        const remove = [
          "nav",
          "footer",
          "header",
          "script",
          "style",
          "noscript",
        ];

        remove.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => el.remove());
        });

        return document.body.innerText.trim();
      });

      const seen = new Set<string>();
      const links: DiscoveredLink[] = [];

      for (const link of rawLinks) {
        const normalized = normalizeUrl(link.url);
        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          links.push({ url: normalized, text: link.text });
        }
      }

      return {
        page: {
          url,
          title,
          content,
          links,
        },
        links,
      };
    } catch (error) {
      console.error(`Failed: ${url}`, error);

      return null;
    } finally {
      await page.close();
    }
  },

  async extractLinks(page: Page, startUrl: URL): Promise<DiscoveredLink[]> {
    const rawLinks = await page.locator("a").evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        url: (anchor as HTMLAnchorElement).href,
        text: (anchor.textContent || "").trim(),
      })),
    );

    const uniqueLinks = new Map<string, DiscoveredLink>();

    for (const link of rawLinks) {
      const normalizedUrl = normalizeUrl(link.url);

      if (!normalizedUrl) {
        continue;
      }

      if (!isHttpUrl(normalizedUrl)) {
        continue;
      }

      if (!isSameDomain(startUrl, normalizedUrl)) {
        continue;
      }

      if (uniqueLinks.has(normalizedUrl)) {
        continue;
      }

      uniqueLinks.set(normalizedUrl, {
        url: normalizedUrl,
        text: link.text.trim(),
      });
    }

    return Array.from(uniqueLinks.values());
  },
};
