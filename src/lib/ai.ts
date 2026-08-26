import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (i < attempts - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export async function aiComplete(
  systemPrompt: string,
  userPrompt: string,
  options?: { model?: string; temperature?: number; maxTokens?: number }
) {
  return withRetry(async () => {
    const res = await getOpenAI().chat.completions.create({
      model: options?.model ?? "gpt-4o",
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  });
}

export async function aiJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const text = await withRetry(async () => {
    const res = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            systemPrompt +
            "\n\nYou MUST respond with valid JSON only. No markdown, no explanation outside the JSON.",
        },
        { role: "user", content: userPrompt },
      ],
    });
    return res.choices[0]?.message?.content ?? "{}";
  });
  return JSON.parse(text) as T;
}

export async function generateExamQuestions(params: {
  subject: string;
  topic: string;
  count: number;
  difficulty: string;
  examType: string;
}) {
  const { subject, topic, count, difficulty, examType } = params;

  const systemPrompt = `You are an expert Nigerian examination question setter. Generate ${examType}-style multiple choice questions for ${subject} on the topic "${topic}".

Difficulty: ${difficulty}
Number of questions: ${count}

Each question must have:
- A clear, unambiguous question stem
- 4 options labeled A, B, C, D with exactly one correct answer
- A detailed explanation of the correct answer
- Appropriate difficulty level matching ${difficulty}

Follow the style and standard of ${examType} examinations. Questions should test understanding, not just recall.`;

  const result = await aiJSON<{
    questions: {
      question: string;
      options: { A: string; B: string; C: string; D: string };
      answer: string;
      explanation: string;
    }[];
  }>(
    systemPrompt,
    `Generate ${count} ${difficulty} difficulty ${examType}-style ${subject} questions on "${topic}". Respond with JSON only.`
  );

  return result.questions.map((q) => ({
    ...q,
    difficulty,
    topic,
  }));
}

export async function generateReportComment(params: {
  studentName: string;
  subjects: { name: string; score: number; grade: string }[];
  attendance: number;
  behavior: string;
}) {
  const { studentName, subjects, attendance, behavior } = params;

  const subjectSummary = subjects
    .map((s) => `${s.name}: ${s.score}% (${s.grade})`)
    .join(", ");

  return aiComplete(
    "You are a Nigerian school teacher writing a concise, professional report card comment for a student. Write 3-5 sentences. Be encouraging but honest. Mention specific subjects where the student excelled or needs improvement. Comment on attendance and behavior. Use proper English.",
    `Student: ${studentName}\nSubjects: ${subjectSummary}\nAttendance: ${attendance}%\nBehavior: ${behavior}\n\nWrite a personalized report card comment.`
  );
}

export async function analyzeStudentPerformance(params: {
  name: string;
  grades: number[];
  attendance: number;
  recentTrend: string;
}) {
  return aiJSON<{
    riskLevel: "low" | "medium" | "high";
    factors: string[];
    recommendations: string[];
    predictedScore: number;
  }>(
    "You are an educational data analyst. Analyze student performance data and provide risk assessment. Respond with JSON only.",
    `Student: ${params.name}\nRecent grades: [${params.grades.join(", ")}]\nAttendance: ${params.attendance}%\nRecent trend: ${params.recentTrend}\n\nAnalyze performance, predict next likely score (0-100), identify risk level, contributing factors, and recommendations.`
  );
}

export async function generateLessonPlan(params: {
  subject: string;
  topic: string;
  classLevel: string;
  duration: string;
}) {
  return aiJSON<{
    objectives: string[];
    materials: string[];
    introduction: string;
    mainContent: { step: string; activity: string; time: string }[];
    evaluation: string;
    assignment: string;
  }>(
    "You are an experienced Nigerian school teacher creating a structured lesson plan. Respond with JSON only.",
    `Subject: ${params.subject}\nTopic: ${params.topic}\nClass Level: ${params.classLevel}\nDuration: ${params.duration}\n\nCreate a detailed lesson plan with clear objectives, materials needed, step-by-step activities, evaluation method, and assignment.`
  );
}

export async function schoolChatbot(params: {
  question: string;
  context: string;
}) {
  return aiComplete(
    `You are a helpful school assistant chatbot for a Nigerian school ERP system. Answer the user's question using ONLY the provided context. If the context doesn't contain enough information, say so politely and suggest contacting the school office. Be concise and friendly.\n\nContext:\n${params.context}`,
    params.question
  );
}
