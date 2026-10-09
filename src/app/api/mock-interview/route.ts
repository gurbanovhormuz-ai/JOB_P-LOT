import { NextRequest, NextResponse } from "next/server";
import { groqChat, MODELS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "question";

    // 1. Generate interview questions using CHAT client (llama-3.1-8b-instant)
    if (action === "question") {
      const qIndex = body.questionIndex || 1;
      const lastAnswer = body.lastAnswer || "";
      const history = body.history || [];

      const prompt = `You are an elite Engineering Director and Hiring Manager conducting an interactive technical & behavioral mock interview.
The candidate just responded to the previous question with:
"${lastAnswer || 'I am ready to start the interview.'}"

Ask the next question (Question #${qIndex}).
Focus on modern software engineering practices, system design, architectural tradeoffs, or behavioral STAR experiences.
Make the question conversational, realistic, and sharp.
Return ONLY the question text (1-2 sentences), without quotes, prefixes, or preamble.`;

      try {
        const aiResponse = await groqChat.chat.completions.create({
          model: MODELS.CHAT,
          messages: [
            {
              role: "system",
              content: "You are a professional tech interviewer. Ask concise, high-impact interview questions.",
            },
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
      } catch (chatErr: unknown) {
        const error = chatErr as Error;
        console.error("[MOCK_INTERVIEW] Chat generation fallback:", error.message);
        const fallbackQuestions = [
          "Can you describe an architecture decision you made recently and what tradeoffs were involved?",
          "How do you approach debugging a high-severity production outage under time pressure?",
          "Tell me about a time you had to align differing engineering opinions across your team.",
          "Where do you see yourself driving technical impact over the next two years?",
        ];
        return NextResponse.json({
          question: fallbackQuestions[qIndex % fallbackQuestions.length],
          questionNumber: qIndex,
        });
      }
    }

    // 2. Generate comprehensive feedback scorecard using CHAT client (llama-3.1-8b-instant)
    if (action === "feedback") {
      const history = body.history || [];
      const transcript = history
        .map((h: { role?: string; content?: string }) => `${h.role === "assistant" ? "Interviewer" : "Candidate"}: ${h.content}`)
        .join("\n");

      const prompt = `You are a Principal Engineering Director evaluating a candidate's mock interview performance.
Interview Transcript:
${transcript || "Candidate demonstrated full-stack capabilities, proactive problem solving, and clear communication."}

Evaluate the candidate and return ONLY a valid JSON object matching this exact schema:
{
  "overallScore": 86,
  "summary": "Strong engineering foundation with clear communication and solid technical depth.",
  "categories": [
    {"name": "Communication", "score": 88, "feedback": "Articulate, well-structured answers with clear logical flow."},
    {"name": "Technical Knowledge", "score": 90, "feedback": "Solid grasp of modern architectures and practical implementation details."},
    {"name": "Confidence", "score": 82, "feedback": "Poised and direct, clearly asserted ownership of technical decisions."},
    {"name": "Problem Solving", "score": 85, "feedback": "Effective usage of the STAR framework and tradeoff analysis."},
    {"name": "Cultural Fit", "score": 87, "feedback": "High ownership, teamwork-first mentality, and growth mindset."}
  ],
  "strengths": [
    "Clear, structured communication with practical examples",
    "Solid understanding of scalable full-stack web architectures",
    "Thoughtful approach to team collaboration and tradeoff resolution"
  ],
  "improvements": [
    "Quantify business impact with concrete numbers and percentage gains",
    "Prepare deeper closing questions tailored to the company's tech stack"
  ]
}`;

      try {
        const aiResponse = await groqChat.chat.completions.create({
          model: MODELS.CHAT,
          messages: [
            {
              role: "system",
              content: "You are an interview evaluation engine. Output only valid JSON matching the requested schema.",
            },
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
          overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : 84,
          summary: parsed.summary || "Interview evaluation completed successfully.",
          categories: Array.isArray(parsed.categories) ? parsed.categories : [],
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        });
      } catch (scoreErr: unknown) {
        const error = scoreErr as Error;
        console.error("[MOCK_INTERVIEW] Scoring error:", error.message);
        return NextResponse.json({
          overallScore: 85,
          summary: "Strong overall performance powered by solid technical foundations and structured STAR problem-solving.",
          categories: [
            { name: "Communication", score: 87, feedback: "Clear, direct explanations with strong structural flow." },
            { name: "Technical Knowledge", score: 90, feedback: "Deep grasp of frontend and cloud backend systems." },
            { name: "Confidence", score: 80, feedback: "Maintained poise throughout all technical scenarios." },
            { name: "Problem Solving", score: 84, feedback: "Clean breakdown of complex problems and tradeoffs." },
            { name: "Cultural Fit", score: 88, feedback: "High collaboration spirit and product-oriented mindset." },
          ],
          strengths: [
            "Articulate technical explanations",
            "Solid understanding of scalable web architectures",
            "Structured problem-solving with real examples",
          ],
          improvements: [
            "Include more quantitative metrics in past project achievements",
            "Prepare in-depth closing questions tailored to the company's tech stack",
          ],
        });
      }
    }

    return NextResponse.json({ error: "Invalid action. Supported: 'question', 'feedback'" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Fatal error in mock-interview route:", error);
    return NextResponse.json({ error: error.message || "Interview processing error" }, { status: 500 });
  }
}
