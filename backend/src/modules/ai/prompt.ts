export function buildRequirementPrompt(jd: string) {
  return `
Extract the meaningful interview-relevant requirements
from the following job description.

For each requirement return:

- text: the original requirement in concise form
- topic: the skill/topic involved
- category:
  TECHNICAL
  BEHAVIORAL
  SYSTEM_DESIGN
  ROLE_SPECIFIC
- importance:
  LOW
  MEDIUM
  HIGH

Do not invent requirements that are not supported
by the job description.

JOB DESCRIPTION:
${jd}
`;
}

export function generateTechnicalQuestionsPrompt(
  topic: string,
  requirement: string,
  count: number,
  companyContext?: string,
) {
  const contextSection = companyContext
    ? `
Company Research Context:
Use this context only when it is relevant to the requirement.
---
${companyContext}
---
`
    : "";

  return `
You are a senior technical interviewer.

Generate exactly ${count} interview questions for the topic "${topic}"
based on the following job requirement:

"${requirement}"

${contextSection}

Rules:

1. Requirement relevance
- The job requirement is the PRIMARY driver for question generation.
- Every question must directly assess knowledge or skills required by the requirement.
- Across the questions, cover different important aspects of the requirement.
- Do not repeatedly test the same concept using different wording.
- Do not introduce unrelated technologies or concepts.

2. Company context
- Company research is SECONDARY context used to make questions more relevant to the company.
- Use company context when it naturally fits the requirement.
- Do not force company-specific context into every question.
- If company context is not relevant, generate the question from the requirement alone.
- Do NOT invent company-specific facts that are not present in the provided context.

3. Difficulty
- Distribute difficulty based on the number of questions:
  - count = 1: MEDIUM
  - count = 2: 1 EASY, 1 MEDIUM
  - count = 3: 1 EASY, 1 MEDIUM, 1 HARD
  - count >= 4: include EASY, MEDIUM, and HARD, with most questions being MEDIUM.
- Difficulty should also be appropriate for the actual requirement.
- Do not make a question artificially difficult just to satisfy the difficulty distribution.

4. Question quality
- Each question must be specific, clear, and answerable.
- Avoid vague or overly broad questions.
- Prefer practical, scenario-based questions when appropriate.
- Avoid questions whose answer is simply a definition when a more meaningful interview question can assess the same concept.
- Do not assume technologies or experience that are not present in the requirement or company context.

5. Guidance
- Guidance must contain 2-4 concise key points an interviewer should listen for.
- Guidance should describe what a strong answer should demonstrate, not provide the complete answer.
- Guidance must be consistent with the question's difficulty.

For each question return:
- question: the interview question
- guidance: 2-4 key points the interviewer should look for
- difficulty: EASY, MEDIUM, or HARD
- category: TECHNICAL
`;
}

export function generateBehavioralQuestionsPrompt(
  topic: string,
  requirement: string,
  count: number,
  companyContext?: string,
) {
  const contextSection = companyContext
    ? `
Company Research Context:
Use this context only when it is relevant to the requirement.
---
${companyContext}
---
`
    : "";

  return `
You are an experienced hiring manager conducting behavioral interviews.

Generate exactly ${count} behavioral interview questions related to "${topic}"
based on the following job requirement:

"${requirement}"

${contextSection}

Rules:

1. Requirement relevance
- The job requirement is the PRIMARY driver for question generation.
- Every question must assess soft skills, behavior, judgment, or experience relevant to the requirement.
- Across the questions, cover different aspects of the requirement.
- Do not repeatedly test the same behavior using different wording.
- Do not introduce unrelated soft skills or situations.

2. Company context
- Company research is SECONDARY context used to make questions more relevant to the company.
- Use company culture, values, working style, products, or domain only when it naturally fits the requirement.
- Do not force company-specific context into every question.
- If company context is not relevant, generate the question from the requirement alone.
- Do NOT invent company-specific facts that are not present in the provided context.

3. Behavioral question quality
- Prefer questions asking about the candidate's actual past experiences.
- Questions should encourage the candidate to explain the situation, their specific actions, decisions, and outcome.
- Use STAR-style framing (Situation, Task, Action, Result) where appropriate.
- Avoid generic hypothetical questions such as "What would you do if...?" unless the requirement specifically calls for hypothetical judgment.
- Avoid questions that can be answered with a simple yes/no response.

4. Difficulty
- Distribute difficulty based on the number of questions:
  - count = 1: MEDIUM
  - count = 2: 1 EASY, 1 MEDIUM
  - count = 3: 1 EASY, 1 MEDIUM, 1 HARD
  - count >= 4: include EASY, MEDIUM, and HARD, with most questions being MEDIUM.
- Behavioral difficulty should reflect the complexity of the situation being explored:
  - EASY: straightforward experience with a clear outcome.
  - MEDIUM: requires handling a challenge, disagreement, or ambiguity.
  - HARD: involves significant conflict, competing priorities, failure, difficult judgment, or multiple stakeholders.
- Do not make a question artificially difficult just to satisfy the difficulty distribution.

5. Guidance
- Guidance should describe what a strong answer should demonstrate.
- Include 2-4 important positive signals.
- Include relevant red flags to watch for.
- Focus on the candidate's behavior, ownership, reasoning, communication, and outcome rather than judging personality.
- Do not provide a model answer.

For each question return:
- question: the behavioral interview question
- guidance: what a strong answer includes and red flags to watch for
- difficulty: EASY, MEDIUM, or HARD
- category: BEHAVIORAL
`;
}

export function generateSystemDesignQuestionsPrompt(
  topic: string,
  requirement: string,
  count: number,
  companyContext?: string,
) {
  const contextSection = companyContext
    ? `
Company Research Context:
Use this context only when it is relevant to the requirement.
---
${companyContext}
---
`
    : "";

  return `
You are a principal engineer conducting a system design interview.

Generate exactly ${count} system design interview questions related to "${topic}"
based on the following job requirement:

"${requirement}"

${contextSection}

Rules:

1. Requirement relevance
- The job requirement is the PRIMARY driver for question generation.
- Every question must assess system design knowledge or architectural ability relevant to the requirement.
- Across the questions, cover different important aspects of the requirement.
- Do not repeatedly test the same architectural concept using different wording.
- Do not introduce unrelated technologies or architectural concepts.

2. Company context
- Company research is SECONDARY context used to make the design problem more relevant to the company.
- Use company products, domain, architecture, infrastructure, or scale only when supported by the provided context.
- Do not force company-specific context into every question.
- If company context is not relevant, generate the question from the requirement alone.
- Do NOT invent company-specific facts that are not present in the provided context.

3. System design question quality
- Questions should require the candidate to design or reason about a system, service, API, or architecture.
- Prefer realistic design problems over questions that simply ask the candidate to define a concept.
- Depending on the requirement, consider relevant areas such as:
  - system architecture
  - API design
  - data modeling
  - database selection
  - caching
  - scalability
  - availability
  - reliability
  - fault tolerance
  - consistency
  - asynchronous processing
  - security
  - observability
  - deployment
- Only include areas that are relevant to the specific design problem.
- Do not unnecessarily introduce microservices, distributed systems, or other advanced architecture patterns.

4. Difficulty
- Distribute difficulty based on the number of questions:
  - count = 1: MEDIUM
  - count = 2: 1 EASY, 1 MEDIUM
  - count = 3: 1 EASY, 1 MEDIUM, 1 HARD
  - count >= 4: include EASY, MEDIUM, and HARD, with most questions being MEDIUM.
- Difficulty should reflect the architectural complexity of the problem:
  - EASY: small system with limited scale and straightforward requirements.
  - MEDIUM: multiple components with meaningful trade-offs and moderate scale.
  - HARD: large-scale or distributed system with significant scalability, reliability, consistency, or fault-tolerance challenges.
- Do not make a question artificially difficult just to satisfy the difficulty distribution.

5. Guidance
- Guidance should outline 3-5 important components, decisions, or trade-offs a strong answer should address.
- Focus on architecture and reasoning rather than requiring one specific implementation.
- Accept multiple valid architectural approaches when appropriate.
- Do not provide a complete model solution.

For each question return:
- question: the system design question
- guidance: key components and trade-offs the answer should address
- difficulty: EASY, MEDIUM, or HARD
- category: SYSTEM_DESIGN
`;
}

export function generateRoleSpecificQuestionsPrompt(
  topic: string,
  requirement: string,
  count: number,
  companyContext?: string,
) {
  const contextSection = companyContext
    ? `
Company Research Context:
Use this context only when it is relevant to the requirement.
---
${companyContext}
---
`
    : "";

  return `
You are a domain expert interviewing candidates for a specialized role.

Generate exactly ${count} role-specific interview questions related to "${topic}"
based on the following job requirement:

"${requirement}"

${contextSection}

Rules:

1. Requirement relevance
- The job requirement is the PRIMARY driver for question generation.
- Every question must assess practical knowledge, experience, judgment, or domain expertise relevant to the requirement.
- Across the questions, cover different important aspects of the requirement.
- Do not repeatedly test the same skill using different wording.
- Do not introduce unrelated technologies, tools, or responsibilities.

2. Company context
- Company research is SECONDARY context used to make questions more relevant to the company.
- Use company tools, workflows, products, processes, or domain practices only when supported by the provided context.
- Do not force company-specific context into every question.
- If company context is not relevant, generate the question from the requirement alone.
- Do NOT invent company-specific facts that are not present in the provided context.

3. Role-specific question quality
- Focus on practical, real-world situations relevant to the role.
- Prefer questions that assess how the candidate has applied their knowledge rather than questions that only test definitions.
- Where appropriate, ask about tools, workflows, decision-making, troubleshooting, trade-offs, and best practices.
- Questions should reflect the level of responsibility implied by the requirement.
- Do not assume experience, tools, or responsibilities that are not supported by the requirement or company context.
- Avoid generic behavioral questions unless they directly relate to the role-specific requirement.

4. Difficulty
- Distribute difficulty based on the number of questions:
  - count = 1: MEDIUM
  - count = 2: 1 EASY, 1 MEDIUM
  - count = 3: 1 EASY, 1 MEDIUM, 1 HARD
  - count >= 4: include EASY, MEDIUM, and HARD, with most questions being MEDIUM.
- Difficulty should reflect the practical complexity of the question:
  - EASY: straightforward role-related task or decision.
  - MEDIUM: requires practical experience and consideration of multiple factors.
  - HARD: involves complex trade-offs, ambiguity, failure scenarios, or significant responsibility.
- Do not make a question artificially difficult just to satisfy the difficulty distribution.

5. Guidance
- Guidance should explain what distinguishes a strong answer from a weak answer.
- Include 2-4 important positive signals.
- Include relevant red flags where appropriate.
- Evaluate practical reasoning, ownership, technical/domain judgment, and awareness of trade-offs.
- Do not provide a complete model answer.

For each question return:
- question: the role-specific interview question
- guidance: what distinguishes a strong answer from a weak one
- difficulty: EASY, MEDIUM, or HARD
- category: ROLE_SPECIFIC
`;
}

export function generateFlashcardPrompt(
  questions: string[],
  answers: string[],
) {
  return `You are creating revision flashcards from an interview question bank.

Given these questions and their answer outlines:

${questions.map((q, i) => q + "\n" + answers[i]).join("\n")}

Create concise flashcards for high-value concepts that candidates should quickly recall.

Rules:
- Front: maximum 12 words.
- Back: maximum 30 words.
- Don't create a card for every question.
- Each card should test one concept.
- Front should be a concise, natural question or recall prompt, not a topic heading.
- Back should be concise and directly answer the front.
- Avoid duplicating cards.
- Don't introduce information not present in the source questions.

For each flashcard return:
- front: the question or recall prompt
- back: the concise answer
`;
}