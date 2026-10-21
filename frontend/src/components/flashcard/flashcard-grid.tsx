"use client";

import { FlashcardCard, type FlashcardItem } from "./flashcard-card";
import type { Flashcard } from "@/services/flashcard.service";

export const SAMPLE_FLASHCARDS: FlashcardItem[] = [
  {
    id: "sample-1",
    front: "What is a closure in JavaScript?",
    back: "A closure is a function that retains access to its lexical scope even when the function is executed outside that lexical scope. It gives an inner function access to an outer function's variables.",
  },
  {
    id: "sample-2",
    front: "How does the event loop work in JavaScript?",
    back: "JavaScript is single-threaded. The event loop continuously monitors the Call Stack and task queues, dequeuing microtasks (Promises) first, then macrotasks (timers, I/O) when the call stack becomes idle.",
  },
  {
    id: "sample-3",
    front: "What is a JWT?",
    back: "A JSON Web Token (JWT) is a compact, URL-safe means of representing claims securely between two parties. It is composed of three base64url-encoded parts: Header, Payload, and Signature.",
  },
  {
    id: "sample-4",
    front: "WHERE vs HAVING in SQL?",
    back: "WHERE filters rows before aggregation (GROUP BY) and cannot contain aggregate functions. HAVING filters rows after aggregation and evaluates conditions on aggregate calculations.",
  },
  {
    id: "sample-5",
    front: "How do you optimize queries on large tables?",
    back: "Create targeted composite or covering indexes, avoid SELECT *, use keyset pagination instead of large OFFSETs, run EXPLAIN to inspect query plans, and consider table partitioning or caching.",
  },
  {
    id: "sample-6",
    front: "What is idempotency in REST APIs?",
    back: "An HTTP method is idempotent if making the same request multiple times produces the identical outcome on the server. GET, PUT, DELETE, and HEAD are idempotent; POST is typically not.",
  },
];

interface FlashcardGridProps {
  cards?: (Flashcard | FlashcardItem)[];
}

export function FlashcardGrid({
  cards,
}: FlashcardGridProps) {
  const displayCards =
    cards && cards.length > 0 ? cards : SAMPLE_FLASHCARDS;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
      {displayCards.map((card, idx) => (
        <FlashcardCard
          key={card.id || idx}
          card={card}
          index={idx}
        />
      ))}
    </div>
  );
}
