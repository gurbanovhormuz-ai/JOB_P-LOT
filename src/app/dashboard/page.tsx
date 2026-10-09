"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Zap,
  Code,
  BriefcaseBusiness,
  GraduationCap,
  Award,
} from "lucide-react";
import Navbar from "@/components/navbar";
import CVUpload from "@/components/cv-upload";

interface CandidateProfile {
  name: string;
  summary: string;
  skills: string[];
  experience: string[] | string;
  education: string[] | string;
  matchScore: number;
}

const defaultProfile: CandidateProfile = {
  name: "Candidate Profile",
  summary: "Upload your CV to see AI-extracted summary and tailored insights.",
  skills: [],
  experience: [],
  education: [],
  matchScore: 0,
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<CandidateProfile>(defaultProfile);
  const [hasUploadedCV, setHasUploadedCV] = useState(false);

  const loadProfile = () => {
    try {
      const stored = localStorage.getItem("jobpilot_candidate_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          name: parsed.name || "Aygun Qurbanova",
          summary: parsed.summary || "No summary provided",
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          experience: Array.isArray(parsed.experience)
            ? parsed.experience
            : parsed.experience
            ? [parsed.experience]
            : [],
          education: Array.isArray(parsed.education)
            ? parsed.education
            : parsed.education
            ? [parsed.education]
            : [],
          matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : 0,
        });
        setHasUploadedCV(true);
      }
    } catch (e) {
      console.warn("Could not load candidate profile:", e);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleStorageChange = () => loadProfile();
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CandidateProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
        setHasUploadedCV(true);
      } else {
        loadProfile();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("candidateProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("candidateProfileUpdated", handleProfileUpdate);
    };
  }, []);

  const quickStats = [
    {
      icon: FileText,
      label: "CV Status",
      value: hasUploadedCV ? "Verified" : "Pending",
      color: hasUploadedCV ? "text-emerald-500 bg-emerald-50" : "text-blue-500 bg-blue-50",
    },
    {
      icon: Target,
      label: "AI Match Score",
      value: `${profile.matchScore || 0}%`,
      color: "text-indigo-500 bg-indigo-50",
    },
    {
      icon: Code,
      label: "Skills Found",
      value: `${profile.skills.length}`,
      color: "text-violet-500 bg-violet-50",
    },
    {
      icon: TrendingUp,
      label: "Profile Strength",
      value: profile.matchScore >= 80 ? "Top 5%" : "Active",
      color: "text-emerald-500 bg-emerald-50",
    },
  ];

  const experienceList = Array.isArray(profile.experience)
    ? profile.experience
    : profile.experience
    ? [profile.experience]
    : [];

  const educationList = Array.isArray(profile.education)
    ? profile.education
    : profile.education
    ? [profile.education]
    : [];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              {hasUploadedCV && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CV Synced
                </span>
              )}
            </div>
            <p className="text-muted mt-1">
              Welcome back, {profile.name}. Review your live candidate profile and ATS match metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-slate-200/80 shadow-sm">
              <Award className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted">ATS Compatibility</p>
                <p className="text-sm font-extrabold text-foreground">{profile.matchScore}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {quickStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass rounded-2xl p-5 card-hover border border-slate-200/80 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Dynamic Candidate Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                <p className="text-xs text-muted">Live Dynamic Candidate Profile from LocalStorage</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{profile.matchScore}% AI Match</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Executive Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Executive Summary</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                {profile.summary || "No summary provided"}
              </p>
            </div>

            {/* Skills Identified */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Code className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Skills Identified ({profile.skills.length})
                </span>
              </div>
              <div className="min-h-[72px] bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-1.5 items-center">
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-white text-primary border border-primary/20 rounded-lg shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Upload CV to extract skills</p>
                )}
              </div>
            </div>

            {/* Experience Highlights */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <BriefcaseBusiness className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Experience Highlights</span>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 min-h-[72px]">
                {experienceList.length > 0 ? (
                  <ul className="space-y-2">
                    {experienceList.map((exp, idx) => (
                      <li key={idx} className="text-sm text-slate-700 leading-relaxed">
                        &bull; {exp}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No experience data available yet.</p>
                )}
              </div>
            </div>

            {/* Education & Background */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Education & Background</span>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 min-h-[72px]">
                {educationList.length > 0 ? (
                  <ul className="space-y-2">
                    {educationList.map((edu, idx) => (
                      <li key={idx} className="text-sm text-slate-700 leading-relaxed">
                        &bull; {edu}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No education data available yet.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CV Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-xl font-bold text-foreground">Upload or Update Your Resume</h2>
            <p className="text-sm text-muted">
              Drag & drop a new PDF to re-parse skills and automatically recalculate job compatibility.
            </p>
          </div>
          <CVUpload />
        </motion.div>
      </main>
    </div>
  );
}
