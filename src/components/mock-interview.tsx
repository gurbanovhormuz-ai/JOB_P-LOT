"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

export default function MockInterview() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "ai" | "user", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), role, content, timestamp: new Date() },
    ]);
  };

  const fetchAIQuestion = async (lastAns?: string) => {
    setIsLoading(true);
    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "question",
          questionIndex: questionCount + 1,
          lastAnswer: lastAns || "",
          history,
        }),
      });
      const data = await res.json();
      if (data && data.question) {
        addMessage("ai", data.question);
        setQuestionCount((c) => c + 1);
      } else {
        addMessage("ai", "Can you elaborate more on your experience with distributed systems and team collaboration?");
        setQuestionCount((c) => c + 1);
      }
    } catch {
      addMessage("ai", "Could you share an example of a technical challenge you recently solved?");
      setQuestionCount((c) => c + 1);
    }
    setIsLoading(false);
  };

  const startInterview = async () => {
    setInterviewStarted(true);
    addMessage(
      "ai",
      "Welcome to your AI Mock Interview! I'll be asking you questions tailored to your engineering background. Answer naturally — either type or speak. Let's begin!"
    );
    await fetchAIQuestion();
  };

  const submitAnswer = async () => {
    const answer = userInput.trim();
    if (!answer) return;
    addMessage("user", answer);
    setUserInput("");

    await fetchAIQuestion(answer);
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording — simulate transcription
      setIsRecording(false);
      const simulatedTranscripts = [
        "I have over three years of experience in full-stack development, primarily working with React and Node.js. I've led multiple projects from concept to deployment.",
        "My biggest strength is my ability to learn quickly and adapt to new technologies. I recently picked up TypeScript and have been using it extensively in production.",
        "I handle tight deadlines by breaking tasks into smaller milestones. I use agile methodology to prioritize and communicate progress with my team.",
        "In my previous role, I optimized our API response times by 60% through implementing caching strategies and database query optimization.",
      ];
      const transcript =
        simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
      setUserInput(transcript);
    } else {
      setIsRecording(true);
    }
  };

  const endInterview = () => {
    // Store results for feedback page
    const feedbackData = {
      totalQuestions: questionCount,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem("interviewFeedback", JSON.stringify(feedbackData));
    router.push("/feedback");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="glass border-b border-white/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI Interview Coach</h2>
            <p className="text-xs text-muted flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {interviewStarted ? "Interview in progress" : "Ready to start"}
            </p>
          </div>
        </div>
        {interviewStarted && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {questionCount} questions asked
            </span>
            <button
              onClick={endInterview}
              className="px-4 py-2 bg-danger text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              End Interview & Get Feedback
            </button>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {!interviewStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Mic className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Mock Interview Simulator
              </h2>
              <p className="text-muted max-w-md">
                Practice with AI-generated interview questions tailored to your
                profile. Get instant feedback on your responses.
              </p>
            </div>
            <button
              onClick={startInterview}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              Start Interview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                      msg.role === "ai"
                        ? "bg-gradient-to-br from-primary to-accent"
                        : "bg-gradient-to-br from-emerald-500 to-teal-400"
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                      msg.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"
                    }`}
                  >
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p className="text-[10px] text-muted mt-2">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="chat-bubble-ai rounded-2xl px-5 py-3.5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm text-muted">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      {interviewStarted && (
        <div className="glass border-t border-white/20 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            {/* Mic button */}
            <button
              onClick={toggleRecording}
              className={`relative shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-danger text-white mic-pulse"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording
                    ? "Listening... Click mic to stop"
                    : "Type your answer or use the microphone..."
                }
                rows={2}
                className="w-full px-5 py-3.5 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            {/* Send button */}
            <button
              onClick={submitAnswer}
              disabled={!userInput.trim() || isLoading}
              className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {isRecording && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-danger mt-2 flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              Recording in progress — click the microphone to stop
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
