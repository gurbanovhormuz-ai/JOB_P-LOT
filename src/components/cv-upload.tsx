"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Upload,
  CheckCircle,
  Loader2,
  Sparkles,
  X,
  File,
  Zap,
  BriefcaseBusiness,
  GraduationCap,
  Code,
  AlertCircle,
  FileText,
} from "lucide-react";

export interface ParsedResult {
  name?: string;
  email?: string;
  summary?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  matchScore?: number;
  parsedFrom?: string;
  fileSizeKb?: number;
}

export type ParsedCVData = ParsedResult;

type UploadState = "idle" | "dragging" | "uploading" | "analyzing" | "done" | "error";

export default function CVUpload() {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    // 1. Validate PDF format
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setErrorMessage("Please upload a valid PDF document.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setErrorMessage("");
    setState("uploading");

    // 2. Prepare multipart/form-data payload
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Transition to AI Analyzing loader
      setState("analyzing");

      // 3. Send to /api/parse-cv
      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      // 4. Receive parsed JSON from Groq
      const data: ParsedResult = await response.json();

      // Backend / response post-processing: clean and deduplicate skills
      const rawSkills = Array.isArray(data.skills) ? data.skills : [];
      const cleanSkills = Array.from(new Set(rawSkills.map((s) => String(s).trim()))).filter(Boolean);

      const candidateProfile = {
        ...data,
        skills: cleanSkills,
      };

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("jobpilot_candidate_profile", JSON.stringify({
            ...data,
            skills: cleanSkills,
          }));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("candidateProfileUpdated", { detail: candidateProfile }));
        }
      } catch (storageErr) {
        console.warn("Failed to persist candidate profile to localStorage:", storageErr);
      }

      setResult({
        ...data,
        skills: cleanSkills,
      });
      setState("done");
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setErrorMessage((err as Error).message || "Failed to parse CV with Groq AI.");
      setState("error");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  };

  const onDragLeave = () => {
    setState("idle");
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setState("idle");
    setFileName("");
    setResult(null);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {/* State 1: Parse Done - Display Live Dynamic Groq JSON */}
        {state === "done" && result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="glass rounded-2xl p-6 flex items-center gap-4 border border-emerald-200/50 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground truncate">
                    {result?.name || "Parsed Candidate"}
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Groq ATS Verified
                  </span>
                </div>
                <p className="text-sm text-muted truncate">
                  {result?.email || "No email detected"}
                  {" • "}
                  {result?.parsedFrom || fileName}
                </p>
              </div>
              <button
                onClick={reset}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-slate-100 transition-colors"
                title="Upload another CV"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live ATS Compatibility Score */}
            <div className="glass rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-bold text-foreground">AI Job Match Score</span>
                </div>
                <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {result?.matchScore ?? 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result?.matchScore ?? 0}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
            </div>

            {/* Dynamic Grid: Summary, Skills, Experience, Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Summary */}
              <div className="glass rounded-2xl p-5 space-y-2 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Executive Summary
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {result?.summary || "No summary available."}
                </p>
              </div>

              {/* Skills */}
              <div className="glass rounded-2xl p-5 space-y-2 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Code className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Extracted Skills ({result?.skills?.length || 0})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(Array.isArray(result?.skills) ? result.skills : []).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-primary border border-blue-100 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="glass rounded-2xl p-5 space-y-2 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <BriefcaseBusiness className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Experience
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {result?.experience || "No experience specified."}
                </p>
              </div>

              {/* Education */}
              <div className="glass rounded-2xl p-5 space-y-2 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Education & Certs
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {result?.education || "No education specified."}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={reset}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
              >
                Upload Different CV
              </button>
            </div>
          </motion.div>
        ) : (
          /* State 2: Upload Zone / Loading Screen */
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => state !== "analyzing" && state !== "uploading" && fileInputRef.current?.click()}
              className={`dropzone rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed ${
                state === "dragging"
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-slate-300 hover:border-primary bg-white/75"
              } ${state === "analyzing" || state === "uploading" ? "pointer-events-none" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={onFileSelect}
                className="hidden"
              />

              <AnimatePresence mode="wait">
                {state === "uploading" || state === "analyzing" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-4 py-4"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-inner">
                        <Loader2 className="w-9 h-9 text-primary animate-spin" />
                      </div>
                      <motion.div
                        className="absolute -inset-3 rounded-2xl border-2 border-primary/30"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-slate-900">
                        {state === "uploading"
                          ? "Uploading PDF document..."
                          : "AI is analyzing your CV..."}
                      </p>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        Extracting raw text buffer with pdf-parse and running Groq ATS parsing...
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">
                        Groq LPU Acceleration
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-4 py-4"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-inner">
                      <Upload className="w-9 h-9 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        Drop your CV here or click to browse
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Accepts standard PDF format (PDF buffer &rarr; Groq ATS)
                      </p>
                    </div>

                    {state === "error" && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        PDF Document
                      </span>
                      <span>{" • "}</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        ATS Parsing
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
