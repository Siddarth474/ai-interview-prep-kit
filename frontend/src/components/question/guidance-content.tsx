export interface ParsedGuidanceItem {
  marker?: string;
  text: string;
}

export interface ParsedGuidance {
  intro?: string;
  items: ParsedGuidanceItem[];
}

export function parseGuidanceText(raw?: string | null): ParsedGuidance {
  if (!raw || !raw.trim()) {
    return { items: [] };
  }

  const text = raw.trim();

  
  const numberedPattern = /(?:^|\n|\s+)(?:(\d+)[).:]|\((\d+)\))\s+/g;
  const numberedMatches = [...text.matchAll(numberedPattern)];

  if (
    numberedMatches.length > 0 &&
    (numberedMatches[0].index === 0 || numberedMatches.length >= 2)
  ) {
    const intro = text.slice(0, numberedMatches[0].index).trim();
    const items: ParsedGuidanceItem[] = [];

    for (let i = 0; i < numberedMatches.length; i++) {
      const match = numberedMatches[i];
      const nextMatch = numberedMatches[i + 1];
      const start = (match.index ?? 0) + match[0].length;
      const end = nextMatch ? (nextMatch.index ?? text.length) : text.length;
      const content = text.slice(start, end).trim();
      const marker = match[1] || match[2] || String(i + 1);

      if (content) {
        items.push({ marker, text: content });
      }
    }

    return { intro: intro || undefined, items };
  }

  
  const bulletPattern = /(?:^|\n|\s+)[•\-*]\s+/g;
  const bulletMatches = [...text.matchAll(bulletPattern)];

  if (bulletMatches.length >= 2) {
    const intro = text.slice(0, bulletMatches[0].index).trim();
    const items: ParsedGuidanceItem[] = [];

    for (let i = 0; i < bulletMatches.length; i++) {
      const match = bulletMatches[i];
      const nextMatch = bulletMatches[i + 1];
      const start = (match.index ?? 0) + match[0].length;
      const end = nextMatch ? (nextMatch.index ?? text.length) : text.length;
      const content = text.slice(start, end).trim();

      if (content) {
        items.push({ marker: "•", text: content });
      }
    }

    return { intro: intro || undefined, items };
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return {
      items: lines.map((line) => ({ text: line })),
    };
  }

  return {
    intro: text,
    items: [],
  };
}

interface GuidanceContentProps {
  guidance?: string | null;
  className?: string;
}

export function GuidanceContent({ guidance, className }: GuidanceContentProps) {
  if (!guidance || !guidance.trim()) {
    return (
      <span className="text-white/40 italic">
        No additional guidance provided for this question.
      </span>
    );
  }

  const { intro, items } = parseGuidanceText(guidance);

  if (items.length === 0) {
    return (
      <p className={`text-white leading-relaxed whitespace-pre-wrap ${className ?? ""}`}>
        {intro}
      </p>
    );
  }

  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      {intro && (
        <p className="text-white/90 font-medium leading-relaxed">{intro}</p>
      )}
      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5 sm:gap-3">
            {item.marker ? (
              <span className="flex size-5 sm:size-5.5 shrink-0 items-center justify-center rounded-md bg-white/10 text-[11px] font-semibold text-white/90 select-none mt-0.5">
                {item.marker}
              </span>
            ) : (
              <span className="size-1.5 rounded-full bg-white/40 shrink-0 mt-2.5 select-none" />
            )}
            <span className="flex-1 text-white/90 text-sm sm:text-base leading-relaxed">
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

