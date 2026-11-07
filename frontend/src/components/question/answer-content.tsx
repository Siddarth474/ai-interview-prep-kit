
export interface AnswerContentProps {
  answer?: string | null;
  className?: string;
  sentencesPerParagraph?: number;
}

export function formatAnswerParagraphs(
  raw?: string | null,
  sentencesPerPara = 3,
): string[] {
  if (!raw || !raw.trim()) {
    return [];
  }

  const rawBlocks = raw.trim().split(/\n\s*\n/);
  const paragraphs: string[] = [];

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.includes("\n")) {
      paragraphs.push(trimmed);
      continue;
    }
    const sentences = trimmed.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);

    if (sentences.length <= sentencesPerPara) {
      paragraphs.push(trimmed);
    } else {
      for (let i = 0; i < sentences.length; i += sentencesPerPara) {
        const chunk = sentences.slice(i, i + sentencesPerPara).join(" ").trim();
        if (chunk) {
          paragraphs.push(chunk);
        }
      }
    }
  }

  return paragraphs;
}

export function AnswerContent({
  answer,
  className,
  sentencesPerParagraph = 3,
}: AnswerContentProps) {
  if (!answer || !answer.trim()) {
    return (
      <span className="text-white/40 italic">
        No model answer provided for this question.
      </span>
    );
  }

  const paragraphs = formatAnswerParagraphs(answer, sentencesPerParagraph);

  if (paragraphs.length <= 1) {
    return (
      <p className={`text-white leading-relaxed whitespace-pre-wrap ${className ?? ""}`}>
        {answer}
      </p>
    );
  }

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-white/90 leading-relaxed whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

