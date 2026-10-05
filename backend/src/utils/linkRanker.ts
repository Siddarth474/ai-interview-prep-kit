export interface DiscoveredLink {
  url: string;
  text: string;
}

const HIGH_VALUE_TERMS = [
  "career",
  "careers",
  "hiring",
  "interview",
  "recruitment",
  "recruiting",
  "job",
  "jobs",
  "open positions",
  "join us",
  "work with us",
  "how we hire",
];

const COMPANY_TERMS = [
  "about",
  "company",
  "mission",
  "vision",
  "culture",
  "values",
  "team",
  "engineering",
  "handbook",
];

const LOW_VALUE_TERMS = [
  "contact",
  "privacy",
  "terms",
  "login",
  "signin",
  "signup",
  "gallery",
];

export function scoreLink(link: DiscoveredLink): number {
  const url = link.url.toLowerCase();
  const text = link.text.toLowerCase();

  let score = 0;

  for (const term of HIGH_VALUE_TERMS) {
    if (url.includes(term)) {
      score += 10;
    }

    if (text.includes(term)) {
      score += 10;
    }
  }

  for (const term of COMPANY_TERMS) {
    if (url.includes(term)) {
      score += 5;
    }

    if (text.includes(term)) {
      score += 5;
    }
  }

  for (const term of LOW_VALUE_TERMS) {
    if (url.includes(term)) {
      score -= 5;
    }

    if (text.includes(term)) {
      score -= 5;
    }
  }

  return score;
}
