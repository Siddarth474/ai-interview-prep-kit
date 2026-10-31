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

5. Answer
- Provide a clear, comprehensive, and technically accurate answer to the question.
- Cover core concepts thoroughly, including practical examples, trade-offs, or best practices where relevant.
- The answer should be detailed and educational.

6. Guidance
- Guidance must contain 2-4 concise key points an interviewer should listen for.
- Guidance should describe what a strong answer should demonstrate.
- Guidance must be consistent with the question's difficulty.

For each question return:
- question: the interview question
- answer: a comprehensive and accurate technical answer to the question
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

5. Answer
- Provide an exemplary model response demonstrating the STAR method (Situation, Task, Action, Result).
- Illustrate strong ownership, proactive problem-solving, collaboration, and measurable outcomes.

6. Guidance
- Guidance should describe what a strong answer should demonstrate.
- Include 2-4 important positive signals.
- Include relevant red flags to watch for.
- Focus on the candidate's behavior, ownership, reasoning, communication, and outcome rather than judging personality.

For each question return:
- question: the behavioral interview question
- answer: an exemplary model answer demonstrating the STAR method and strong ownership
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

5. Answer
- Provide a structured, in-depth architectural solution to the design problem.
- Outline key components, data flow, API design, storage/caching decisions, trade-offs, and scalability/reliability considerations.

6. Guidance
- Guidance should outline 3-5 important components, decisions, or trade-offs a strong answer should address.
- Focus on architecture and reasoning rather than requiring one specific implementation.
- Accept multiple valid architectural approaches when appropriate.

For each question return:
- question: the system design question
- answer: a structured and detailed architectural solution addressing the design problem and trade-offs
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

5. Answer
- Provide a detailed, practical model answer demonstrating real-world domain expertise and best practices.
- Cover realistic workflows, tools, troubleshooting, and decision-making criteria.

6. Guidance
- Guidance should explain what distinguishes a strong answer from a weak answer.
- Include 2-4 important positive signals.
- Include relevant red flags where appropriate.
- Evaluate practical reasoning, ownership, technical/domain judgment, and awareness of trade-offs.

For each question return:
- question: the role-specific interview question
- answer: a detailed, practical model answer demonstrating domain expertise and best practices
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

export function buildRoleBreakdownPrompt(jd: string): string {
  return `You are an expert technical recruiter and engineering hiring manager.
Analyze the following Job Description (JD) and extract a comprehensive, structured role breakdown.

Extract the following:
1. roleTitle: The primary job title or role (e.g., 'Senior Full Stack Engineer', 'Backend Developer', 'DevOps Engineer'). If not explicitly stated, infer the most accurate professional title from the responsibilities and tech stack.
2. responsibilities: An array of concise, high-impact bullet points describing what this engineer will own, build, deliver, and maintain.
3. requiredSkills: Core engineering and domain competencies (e.g., 'System Architecture', 'API Design', 'Microservices', 'Distributed Systems', 'Agile/Scrum', 'Testing & CI/CD').
4. technologies: Specific programming languages, frameworks, libraries, cloud providers, and databases explicitly mentioned or directly required (e.g., 'TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS').

Guidelines:
- Do not invent technologies or requirements that are not supported by the job description.
- Keep bullet points clear and concise.

JOB DESCRIPTION:
${jd}
`;
}

export function buildCompanyBriefPrompt(
  companyUrl: string,
  sources: Array<{ url: string; title: string | null; content: string }>,
  jobDescription?: string,
): string {
  const sourcesText =
    sources.length > 0
      ? sources
          .map(
            (s, idx) =>
              `### Source ${idx + 1}: ${s.title ? s.title + " - " : ""}${s.url}\n${s.content.slice(0, 3500).trim()}`,
          )
          .join("\n\n---\n\n")
      : "No crawled webpage content available. Rely on company URL and job description.";

  const jdSection = jobDescription
    ? `\n\nJOB DESCRIPTION (Provides context on role, team, and company description):\n${jobDescription.slice(0, 3000).trim()}`
    : "";

  return `You are an expert corporate researcher, technical recruiter, and interview intelligence analyst.
Analyze the following crawled web sources and context for the company located at "${companyUrl}" to extract a high-signal Company Brief tailored for an interview candidate.

EXTRACTION GOALS:
1. companyName: The accurate, canonical company name.
2. overview: A rich 2-4 paragraph overview covering what the company does, their primary mission, target market, scale/stage, and core value proposition.
3. industry: Primary industry or sector (e.g., 'Fintech / Developer Tools', 'Enterprise SaaS', 'HealthTech').
4. products: Structured details including a summary of their product catalog, a list of flagship products/services with descriptions and target users, and key technology/platform highlights.
5. culture: Core cultural values, work environment philosophy (e.g., remote-friendly, fast iteration, high ownership), and engineering culture/practices.
6. hiringInfo: Interview process insights (stages/rounds), what traits and skills they look for in candidates, and actionable candidate preparation tips.

RULES & CONSTRAINTS:
- Ground your information in the crawled sources and factual industry knowledge of this company.
- Do not invent fictitious products, founders, or fake interview rounds.
- If specific hiring steps are not explicitly stated in the sources, provide high-quality interview preparation guidance relevant to the company's domain and engineering culture.

CRAWLED RESEARCH SOURCES:
${sourcesText}
${jdSection}
`;
}
