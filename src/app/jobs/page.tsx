"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Send,
  CheckCircle,
  Briefcase,
  Filter,
  Search,
  Star,
  Zap,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useToast } from "@/components/ui/toaster";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  matchScore: number;
  tags: string[];
  description: string;
  logo: string;
  applied: boolean;
}

const initialJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechNova Inc.",
    location: "San Francisco, CA (Remote)",
    salary: "$150K - $190K",
    type: "Full-time",
    posted: "2 hours ago",
    matchScore: 0,
    tags: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    description:
      "Build next-gen web apps using React and TypeScript. Lead frontend architecture decisions, mentor junior developers, and own the design system.",
    logo: "TN",
    applied: false,
  },
  {
    id: "2",
    title: "Full-Stack Developer",
    company: "CloudScale Systems",
    location: "New York, NY (Hybrid)",
    salary: "$130K - $170K",
    type: "Full-time",
    posted: "5 hours ago",
    matchScore: 0,
    tags: ["Node.js", "React", "PostgreSQL", "AWS"],
    description:
      "Build and maintain scalable microservices and modern web applications. Strong focus on API design and cloud infrastructure.",
    logo: "CS",
    applied: false,
  },
  {
    id: "3",
    title: "Cybersecurity Analyst",
    company: "SecureNet Azerbaijan",
    location: "Baku, AZ (On-site)",
    salary: "₼3,500 - ₼6,000/mo",
    type: "Full-time",
    posted: "3 hours ago",
    matchScore: 0,
    tags: ["SIEM", "Linux", "Python", "Network Security", "Wireshark"],
    description:
      "Monitor and defend enterprise network infrastructure. Conduct vulnerability assessments, manage SIEM platforms, and respond to security incidents in real-time.",
    logo: "SN",
    applied: false,
  },
  {
    id: "4",
    title: "Frontend Architect",
    company: "DesignForge",
    location: "Austin, TX (Remote)",
    salary: "$160K - $200K",
    type: "Full-time",
    posted: "1 day ago",
    matchScore: 0,
    tags: ["React", "GraphQL", "Design Systems", "TypeScript"],
    description:
      "Define and implement frontend architecture for our SaaS platform. Build component libraries and establish best practices.",
    logo: "DF",
    applied: false,
  },
  {
    id: "5",
    title: "AI/ML Engineer",
    company: "DataPulse AI",
    location: "Seattle, WA (Remote)",
    salary: "$155K - $195K",
    type: "Full-time",
    posted: "6 hours ago",
    matchScore: 0,
    tags: ["Python", "TensorFlow", "PyTorch", "Docker", "ML"],
    description:
      "Design and deploy machine learning models for real-time analytics. Build data pipelines and work closely with product teams on AI-powered features.",
    logo: "DP",
    applied: false,
  },
  {
    id: "6",
    title: "SOC Engineer — Cybersecurity",
    company: "CyberShield Group",
    location: "Remote (Europe)",
    salary: "€55K - €80K",
    type: "Full-time",
    posted: "1 day ago",
    matchScore: 0,
    tags: ["SIEM", "Splunk", "Incident Response", "Linux", "Firewall"],
    description:
      "Join our Security Operations Center. Monitor alerts, triage incidents, write detection rules in Splunk/ELK, and coordinate vulnerability remediation.",
    logo: "CG",
    applied: false,
  },
  {
    id: "7",
    title: "Backend Engineer (Node.js)",
    company: "PayFlow Fintech",
    location: "London, UK (Hybrid)",
    salary: "£70K - £95K",
    type: "Full-time",
    posted: "8 hours ago",
    matchScore: 0,
    tags: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker"],
    description:
      "Architect and build high-throughput payment APIs processing millions of transactions. Ensure PCI-DSS compliance and sub-100ms latency.",
    logo: "PF",
    applied: false,
  },
  {
    id: "8",
    title: "React Native Developer",
    company: "MobileFirst Labs",
    location: "Remote (US)",
    salary: "$120K - $155K",
    type: "Contract",
    posted: "3 days ago",
    matchScore: 0,
    tags: ["React Native", "TypeScript", "iOS", "Android"],
    description:
      "Build cross-platform mobile applications for fintech clients. Experience with payment integrations and biometric auth is a plus.",
    logo: "ML",
    applied: false,
  },
  {
    id: "9",
    title: "DevOps / SRE Engineer",
    company: "InfraCore Solutions",
    location: "Denver, CO (Remote)",
    salary: "$135K - $165K",
    type: "Full-time",
    posted: "4 days ago",
    matchScore: 0,
    tags: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    description:
      "Manage cloud infrastructure and CI/CD pipelines. Automate deployments and ensure 99.99% uptime for production systems.",
    logo: "IC",
    applied: false,
  },
  {
    id: "10",
    title: "Next.js Full-Stack Developer",
    company: "Vercel Partner Studio",
    location: "Remote (Global)",
    salary: "$140K - $180K",
    type: "Full-time",
    posted: "1 hour ago",
    matchScore: 0,
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma"],
    description:
      "Build server-rendered React applications with Next.js App Router. Own the full stack from database schema to production deployment on Vercel.",
    logo: "VP",
    applied: false,
  },
  {
    id: "11",
    title: "Penetration Tester",
    company: "CyberJob.az",
    location: "Baku, AZ (Hybrid)",
    salary: "₼4,000 - ₼7,000/mo",
    type: "Full-time",
    posted: "12 hours ago",
    matchScore: 0,
    tags: ["Kali Linux", "Burp Suite", "Python", "Network Security", "OWASP"],
    description:
      "Conduct authorized penetration tests on web apps and network infrastructure. Write detailed reports and work with dev teams to remediate vulnerabilities.",
    logo: "CJ",
    applied: false,
  },
  {
    id: "12",
    title: "Data Engineer",
    company: "Insight Analytics",
    location: "Berlin, DE (Remote)",
    salary: "€65K - €90K",
    type: "Full-time",
    posted: "2 days ago",
    matchScore: 0,
    tags: ["Python", "SQL", "Apache Spark", "AWS", "Airflow"],
    description:
      "Design and maintain ETL pipelines processing terabytes of data daily. Build data warehouses and enable real-time analytics dashboards.",
    logo: "IA",
    applied: false,
  },
  {
    id: "13",
    title: "Cloud Security Architect",
    company: "GovSecure Solutions",
    location: "Washington, DC (On-site)",
    salary: "$160K - $210K",
    type: "Full-time",
    posted: "5 days ago",
    matchScore: 0,
    tags: ["AWS", "Azure", "Zero Trust", "IAM", "Compliance"],
    description:
      "Design and implement zero-trust security architectures for government cloud environments. Lead FedRAMP compliance and IAM strategy.",
    logo: "GS",
    applied: false,
  },
  {
    id: "14",
    title: "Junior Web Developer",
    company: "StartupHub Baku",
    location: "Baku, AZ (On-site)",
    salary: "₼1,500 - ₼2,500/mo",
    type: "Full-time",
    posted: "1 day ago",
    matchScore: 0,
    tags: ["HTML", "CSS", "JavaScript", "React", "Git"],
    description:
      "Join a fast-growing Baku startup building modern web interfaces. Great opportunity for recent graduates passionate about frontend development.",
    logo: "SH",
    applied: false,
  },
  {
    id: "15",
    title: "Platform Engineer",
    company: "ScaleMesh",
    location: "Toronto, CA (Remote)",
    salary: "$130K - $160K",
    type: "Full-time",
    posted: "3 days ago",
    matchScore: 0,
    tags: ["Go", "Kubernetes", "gRPC", "PostgreSQL", "Terraform"],
    description:
      "Build and operate the internal developer platform. Design service meshes, implement observability, and enable teams to ship faster.",
    logo: "SM",
    applied: false,
  },
  {
    id: "16",
    title: "UI/UX Engineer",
    company: "PixelCraft Design",
    location: "Remote (EU/US)",
    salary: "$110K - $145K",
    type: "Full-time",
    posted: "2 days ago",
    matchScore: 0,
    tags: ["React", "Figma", "CSS", "Accessibility", "Storybook"],
    description:
      "Bridge design and engineering. Implement pixel-perfect, accessible UI components from Figma specs and maintain the component library.",
    logo: "PC",
    applied: false,
  },
];

// Fuzzy Skill Matching Engine
function calculateJobMatch(jobSkills: string[] = [], candidateSkills: string[] = []): number {
  if (!candidateSkills || candidateSkills.length === 0) return 15;

  // Strip punctuation, spaces, and hyphens (e.g., "Next.js" -> "nextjs")
  const normalize = (str: string) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedCandidateSkills = candidateSkills.map(normalize);

  let matchedCount = 0;
  jobSkills.forEach((jobSkill) => {
    const cleanJobSkill = normalize(jobSkill);
    const hasMatch = normalizedCandidateSkills.some(
      (cSkill) => cSkill.includes(cleanJobSkill) || cleanJobSkill.includes(cSkill)
    );
    if (hasMatch) matchedCount++;
  });

  const score = Math.round((matchedCount / jobSkills.length) * 100);
  return Math.max(score, 15); // Minimum fallback 15%
}

function isSkillMatched(tag: string, candidateSkills: string[]): boolean {
  if (!candidateSkills || candidateSkills.length === 0) return false;
  const normalize = (str: string) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTag = normalize(tag);
  return candidateSkills.some((cs) => {
    const cleanCs = normalize(cs);
    return cleanCs.includes(cleanTag) || cleanTag.includes(cleanCs);
  });
}

function getMatchColor(score: number) {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-gray-600 bg-gray-50 border-gray-200";
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [candidateSkills, setCandidateSkills] = useState<string[]>([]);
  const [candidateName, setCandidateName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const updateJobMatches = () => {
      try {
        const stored = localStorage.getItem("jobpilot_candidate_profile");
        if (stored) {
          const profile = JSON.parse(stored);
          const skills: string[] = Array.isArray(profile.skills) ? profile.skills : [];
          setCandidateSkills(skills);
          if (profile.name) setCandidateName(profile.name);

          setJobs(
            initialJobs
              .map((job) => ({
                ...job,
                matchScore: calculateJobMatch(job.tags, skills),
              }))
              .sort((a, b) => b.matchScore - a.matchScore)
          );
        } else {
          // Default baseline calculation
          setJobs(
            initialJobs.map((job) => ({
              ...job,
              matchScore: calculateJobMatch(job.tags, []),
            }))
          );
        }
      } catch (err) {
        console.warn("Error updating dynamic job matches:", err);
      }
    };

    updateJobMatches();

    window.addEventListener("storage", updateJobMatches);
    window.addEventListener("candidateProfileUpdated", updateJobMatches);
    return () => {
      window.removeEventListener("storage", updateJobMatches);
      window.removeEventListener("candidateProfileUpdated", updateJobMatches);
    };
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAutoApply = async (jobId: string) => {
    setApplyingId(jobId);

    // Simulate AI generating cover letter and applying
    await new Promise((r) => setTimeout(r, 1500));

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j))
    );
    setApplyingId(null);

    addToast("Cover letter generated and application sent!", "success");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                Job Matches
              </h1>
              {candidateSkills.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  Dynamic Skill Match Active
                </span>
              )}
            </div>
            <p className="text-muted mt-1">
              {filteredJobs.length} opportunities ranked by compatibility
              {candidateName ? ` for ${candidateName}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs or skills..."
                className="pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64"
              />
            </div>
            <button className="p-2.5 bg-surface border border-border rounded-xl text-muted hover:text-foreground transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Candidate Skills Pill Bar */}
        {candidateSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl glass border border-slate-200/80 flex flex-wrap items-center gap-2"
          >
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider mr-1">
              Your Extracted Skills:
            </span>
            {candidateSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-primary border border-blue-100 rounded-md"
              >
                {skill}
              </span>
            ))}
          </motion.div>
        )}

        {/* Job Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-6 card-hover border border-slate-200/80"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Job Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center font-bold text-primary shrink-0">
                      {job.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-foreground">
                          {job.title}
                        </h2>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getMatchColor(
                            job.matchScore
                          )}`}
                        >
                          {job.matchScore}% Compatibility
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted mt-0.5">
                        {job.company}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {job.posted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {job.applied ? (
                      <span className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle className="w-4 h-4" />
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAutoApply(job.id)}
                        disabled={applyingId === job.id}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 rounded-xl transition-all disabled:opacity-50"
                      >
                        {applyingId === job.id ? (
                          <>
                            <Zap className="w-4 h-4 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Auto-Apply
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Description & Tags */}
                <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/50">
                  {job.tags.map((tag) => {
                    const isMatched = isSkillMatched(tag, candidateSkills);
                    return (
                      <span
                        key={tag}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          isMatched
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold"
                            : "bg-surface-secondary text-muted"
                        }`}
                      >
                        {isMatched ? `✓ ${tag}` : tag}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
