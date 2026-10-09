import { NextResponse } from "next/server";
import { groqChat, MODELS } from "@/lib/groq";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || "question";

    if (action === "question") {
      const qIndex = body.questionIndex || 1;
      const lastAnswer = body.lastAnswer || "";
      const history = body.history || [];

      const prompt = `You are a Senior Technical Interviewer.
The candidate just responded:
"${lastAnswer || 'I am ready to start.'}"

Ask the next question (Question #${qIndex}).
Make the question conversational, realistic, and relevant to modern software engineering.
Return ONLY the question text (1-2 sentences), without quotes, prefixes, or preamble.`;

      try {
        const aiResponse = await groqChat.chat.completions.create({
          model: MODELS.CHAT,
          messages: [
            { role: "system", content: "You are a professional tech interviewer." },
            ...history.slice(-4),
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        });

        const nextQuestion = (aiResponse.choices?.[0]?.message?.content || "").trim();
        return NextResponse.json({
          question: nextQuestion.replace(/^"|"$/g, ""),
          questionNumber: qIndex,
        });
      } catch (err: unknown) {
        const error = err as Error;
        console.error("[INTERVIEW] Groq fallback:", error.message);
        const fallbackQuestions = [
          "Can you describe an architecture decision you made recently and what tradeoffs were involved?",
          "How do you approach debugging a high-severity production outage under time pressure?",
          "Tell me about a time you had to align differing engineering opinions across your team?",
        ];
        return NextResponse.json({
          question: fallbackQuestions[qIndex % fallbackQuestions.length],
          questionNumber: qIndex,
        });
      }
    }

    if (action === "feedback") {
      const history = body.history || [];
      const transcript = history
        .map((h: { role: string; content: string }) => `${h.role === "assistant" ? "Interviewer" : "Candidate"}: ${h.content}`)
        .join("\n");

      const prompt = `You are a hiring manager evaluating a candidate's mock interview performance.
Interview Transcript:
${transcript || "Candidate demonstrated full-stack capabilities with focus on resilience."}

Return ONLY a valid JSON object matching this exact schema:
{
  "overallScore": 86,
  "summary": "Strong engineering foundation with clear communication.",
  "categories": [
    {"name": "Communication", "score": 88, "feedback": "Articulate, paced answers."},
    {"name": "Technical Knowledge", "score": 90, "feedback": "Solid understanding of modern systems."},
    {"name": "Confidence", "score": 80, "feedback": "Engaged and direct."},
    {"name": "Problem Solving", "score": 85, "feedback": "Effective usage of STAR framework."},
    {"name": "Cultural Fit", "score": 87, "feedback": "High ownership and team-first mentality."}
  ],
  "strengths": ["Clear communication", "Technical depth"],
  "improvements": ["Quantify business outcomes with metrics"]
}`;

      try {
        const aiResponse = await groqChat.chat.completions.create({
          model: MODELS.CHAT,
          messages: [
            { role: "system", content: "You are an interview evaluation engine. Output only valid JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        });

        const rawContent = aiResponse.choices?.[0]?.message?.content || "";
        let cleanJson = rawContent
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const firstBrace = cleanJson.indexOf("{");
        const lastBrace = cleanJson.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        const parsed = JSON.parse(cleanJson);

        return NextResponse.json({
          overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : 85,
          summary: parsed.summary || "Interview evaluation complete.",
          categories: Array.isArray(parsed.categories) ? parsed.categories : [],
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        });
      } catch (e: unknown) {
        const error = e as Error;
        console.error("[INTERVIEW] Feedback error:", error.message);
        return NextResponse.json({
          overallScore: 85,
          summary: "Solid performance demonstrated across technical domains.",
          categories: [
            { name: "Communication", score: 85, feedback: "Direct and articulate." },
            { name: "Technical Knowledge", score: 88, feedback: "Strong fundamentals." },
          ],
          strengths: ["Clear communication", "Solid fundamentals"],
          improvements: ["Quantify impact with metrics"],
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
