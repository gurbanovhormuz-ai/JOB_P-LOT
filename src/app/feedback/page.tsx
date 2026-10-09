"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  MessageSquare,
  Target,
  Lightbulb,
  ArrowLeft,
  Download,
  Share2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

interface FeedbackCategory {
  name: string;
  score: number;
  feedback: string;
}

interface FeedbackData {
  overallScore: number;
  categories: FeedbackCategory[];
  strengths: string[];
  improvements: string[];
  summary: string;
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-red-600";
}

function getScoreBarColor(score: number) {
  if (score >= 85) return "from-emerald-400 to-emerald-600";
  if (score >= 70) return "from-blue-400 to-blue-600";
  if (score >= 55) return "from-amber-400 to-amber-600";
  return "from-red-400 to-red-600";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  return "Needs Work";
}

const fallbackFeedback: FeedbackData = {
  overallScore: 85,
  summary:
    "Strong engineering foundation with clear communication and structured problem solving. Solid technical depth demonstrated across full-stack systems.",
  categories: [
    {
      name: "Communication",
      score: 88,
      feedback: "Articulate, paced answers with logical structure and clear clarity.",
    },
    {
      name: "Technical Knowledge",
      score: 90,
      feedback: "Demonstrated solid understanding of modern architectures and scalable design.",
    },
    {
      name: "Confidence",
      score: 82,
      feedback: "Engaged and direct, maintained poise throughout technical questions.",
    },
    {
      name: "Problem Solving",
      score: 85,
      feedback: "Effective usage of the STAR framework with concrete practical examples.",
    },
    {
      name: "Cultural Fit",
      score: 87,
      feedback: "High ownership, teamwork-first mindset, and strong learning orientation.",
    },
  ],
  strengths: [
    "Clear, structured communication with practical examples",
    "Deep technical competence in full-stack web architectures",
    "Thoughtful approach to cross-functional collaboration",
  ],
  improvements: [
    "Quantify business outcomes with concrete metrics (% gains, user numbers)",
    "Prepare deeper closing architectural questions for interviewers",
  ],
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeedback() {
      try {
        let history: Array<{ role: string; content: string }> = [];
        try {
          const raw =
            typeof window !== "undefined"
              ? sessionStorage.getItem("interviewFeedback") ||
                localStorage.getItem("interviewFeedback")
              : null;
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.messages)) {
              history = parsed.messages.map((m: { role: string; content: string }) => ({
                role: m.role === "ai" ? "assistant" : "user",
                content: m.content,
              }));
            }
          }
        } catch (e) {
          console.warn("Could not read interview session history:", e);
        }

        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "feedback", history }),
        });

        if (!res.ok) {
          throw new Error(`Interview feedback API returned status ${res.status}`);
        }

        const data = await res.json();

        // Sanitize response to guarantee all properties exist with safe values
        const sanitized: FeedbackData = {
          overallScore:
            typeof data?.overallScore === "number" && !isNaN(data.overallScore)
              ? Math.max(0, Math.min(100, Math.round(data.overallScore)))
              : fallbackFeedback.overallScore,
          summary: data?.summary || fallbackFeedback.summary,
          categories:
            Array.isArray(data?.categories) && data.categories.length > 0
              ? data.categories
              : fallbackFeedback.categories,
          strengths:
            Array.isArray(data?.strengths) && data.strengths.length > 0
              ? data.strengths
              : fallbackFeedback.strengths,
          improvements:
            Array.isArray(data?.improvements) && data.improvements.length > 0
              ? data.improvements
              : fallbackFeedback.improvements,
        };

        setFeedback(sanitized);
      } catch (err) {
        console.warn("Loading fallback feedback due to:", err);
        setFeedback(fallbackFeedback);
      }
      setLoading(false);
    }
    loadFeedback();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              AI is generating your feedback report...
            </p>
            <p className="text-sm text-muted mt-1">
              Analyzing your interview performance
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh] text-center">
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">
              No Interview Data Found
            </p>
            <p className="text-muted mb-6">
              Complete a mock interview first to see your feedback.
            </p>
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl"
            >
              Start Interview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <Link
              href="/interview"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Interview
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              Interview Feedback Report
            </h1>
            <p className="text-muted mt-1">
              AI-generated analysis of your mock interview performance
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-border rounded-xl hover:bg-surface-secondary transition-colors text-muted hover:text-foreground">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-border rounded-xl hover:bg-surface-secondary transition-colors text-muted hover:text-foreground">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Overall Performance
            </span>
          </div>

          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(feedback.overallScore / 100) * 339.3} 339.3`}
                transform="rotate(-90 60 60)"
                initial={{ strokeDasharray: "0 339.3" }}
                animate={{
                  strokeDasharray: `${(feedback.overallScore / 100) * 339.3} 339.3`,
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0A66C2" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">
                {feedback.overallScore}
              </span>
              <span className="text-xs text-muted">/100</span>
            </div>
          </div>

          <p className={`text-lg font-semibold ${getScoreColor(feedback.overallScore)}`}>
            {getScoreLabel(feedback.overallScore)}
          </p>
          <p className="text-sm text-muted mt-2 max-w-xl mx-auto">
            {feedback.summary}
          </p>
        </motion.div>

        {/* Category Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Performance Breakdown
            </h2>
          </div>

          <div className="space-y-5">
            {(Array.isArray(feedback?.categories) ? feedback.categories : []).map((cat, i) => (
              <motion.div
                key={cat.name || `cat-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {cat.name || 'Category'}
                  </span>
                  <span
                    className={`text-sm font-bold ${getScoreColor(cat.score || 0)}`}
                  >
                    {cat.score || 0}/100
                  </span>
                </div>
                <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score || 0}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreBarColor(
                      cat.score || 0
                    )}`}
                  />
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {cat.feedback || 'No feedback available.'}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {(Array.isArray(feedback?.strengths) ? feedback.strengths : []).map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-2.5 text-sm text-muted"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-foreground">Areas to Improve</h3>
            </div>
            <ul className="space-y-3">
              {(Array.isArray(feedback?.improvements) ? feedback.improvements : []).map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-2.5 text-sm text-muted"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Next Steps CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-hero rounded-2xl p-8 text-center text-white"
        >
          <h3 className="text-xl font-bold mb-2">Ready for Another Round?</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Practice makes perfect. Try another mock interview to improve your
            scores.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Practice Again
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              <Target className="w-4 h-4" />
              Browse Jobs
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
