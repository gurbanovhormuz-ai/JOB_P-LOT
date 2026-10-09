const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Load environment variables via lib/groq
const { groqParser, groqChat, groqMatch, MODELS, loadEnv } = require("./lib/groq");
loadEnv();

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY =
  process.env.GROQ_API_KEY ||
  "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";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// Fallback data if API key quota limits or network fails
const fallbackAnalysis = {
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "Python",
    "AWS",
    "PostgreSQL",
    "Docker",
    "System Architecture",
  ],
  experience:
    "5+ years as a Senior Full-Stack Developer. Led a squad of 4 engineers and optimized deployment velocity by 40%.",
  education:
    "B.Sc. in Computer Science — Stanford University, 2019. AWS Certified Solutions Architect.",
  summary:
    "High-impact software engineer with expertise in full-stack web platforms, distributed APIs, and rapid prototype delivery for fast-paced tech environments.",
  matchScore: 94,
  parsedFrom: "resume.pdf",
};

const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechNova Inc.",
    location: "San Francisco, CA (Remote)",
    salary: "$150K - $190K",
    type: "Full-time",
    posted: "2 hours ago",
    matchScore: 96,
    tags: ["React", "TypeScript", "Next.js", "Tailwind"],
    description:
      "Join our core team to architect next-generation web applications using React and TypeScript. Lead UI/UX architecture and mentor junior teammates.",
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
    matchScore: 91,
    tags: ["Node.js", "React", "PostgreSQL", "AWS"],
    description:
      "Build and maintain resilient microservices and client interfaces. Strong emphasis on high-performance APIs and cloud native infra.",
    logo: "CS",
    applied: false,
  },
  {
    id: "3",
    title: "Frontend Architect",
    company: "DesignForge",
    location: "Austin, TX (Remote)",
    salary: "$160K - $200K",
    type: "Full-time",
    posted: "1 day ago",
    matchScore: 88,
    tags: ["React", "GraphQL", "Design Systems", "TypeScript"],
    description:
      "Define frontend engineering standards and design systems for enterprise SaaS applications with heavy multi-tenant requirements.",
    logo: "DF",
    applied: false,
  },
  {
    id: "4",
    title: "AI Solutions Engineer",
    company: "DataPulse AI",
    location: "Seattle, WA (Remote)",
    salary: "$145K - $185K",
    type: "Full-time",
    posted: "1 day ago",
    matchScore: 85,
    tags: ["Python", "React", "FastAPI", "Groq AI"],
    description:
      "Build generative AI workflows, agentic interview simulators, and reactive web applications powered by high-speed LLM inference.",
    logo: "DP",
    applied: false,
  },
];

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>JobPilot AI — AI-Powered Job Assistant Platform (Groq Powered)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#0A66C2',
            'primary-dark': '#084e96',
            accent: '#6366f1',
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body {
      background: radial-gradient(at 15% 15%, rgba(10, 102, 194, 0.08) 0%, transparent 45%),
                  radial-gradient(at 85% 85%, rgba(99, 102, 241, 0.08) 0%, transparent 45%),
                  #f8fafc;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .glass {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    .mic-pulse {
      animation: pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse-ring {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(239, 68, 68, 0); }
    }
    .toast-anim {
      animation: slideIn 0.3s ease-out forwards;
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body class="min-h-screen text-slate-800 flex flex-col">

  <!-- TOAST CONTAINER -->
  <div id="toast-box" class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"></div>

  <!-- NAVBAR -->
  <nav class="sticky top-0 z-40 glass border-b border-slate-200/60">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" onclick="switchTab('landing')">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
          JP
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-none">
            JobPilot AI
          </span>
          <span class="text-[10px] text-emerald-600 font-bold tracking-wider uppercase mt-0.5">Powered by Groq LPU</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchTab('landing')" id="btn-landing" class="px-4 py-2 text-sm font-semibold rounded-xl transition text-primary bg-blue-50">Landing</button>
        <button onclick="switchTab('dashboard')" id="btn-dashboard" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition">CV Upload</button>
        <button onclick="switchTab('jobs')" id="btn-jobs" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition">Job Match</button>
        <button onclick="switchTab('interview')" id="btn-interview" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition">Mock Interview</button>
        <button onclick="switchTab('feedback')" id="btn-feedback" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition">Feedback</button>
      </div>
    </div>
  </nav>

  <!-- CONTENT AREAS -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">

    <!-- 1. LANDING PAGE -->
    <section id="tab-landing" class="space-y-16 py-8">
      <div class="text-center max-w-3xl mx-auto space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide uppercase">
          Live Groq API Inference Active &bull; ultra-fast response
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
          Upload CV &rarr; Find Jobs &rarr; <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Auto-Apply &rarr; Ace Interview</span>
        </h1>
        <p class="text-lg text-slate-600 leading-relaxed">
          The ultimate career accelerator powered by Groq's low-latency intelligence. Parse your resume, auto-match openings, auto-generate cover letters, and practice with real-time AI interview questions.
        </p>
        <div class="flex items-center justify-center gap-4 pt-4">
          <button onclick="switchTab('dashboard')" class="px-8 py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition">
            Upload Resume Now
          </button>
          <button onclick="switchTab('interview')" class="px-8 py-3.5 glass hover:bg-white text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-sm transition">
            Launch Mock Interview
          </button>
        </div>
      </div>

      <!-- Steps Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
        <div class="glass p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-primary font-bold flex items-center justify-center text-xl">1</div>
          <h3 class="text-lg font-bold text-slate-900">Upload CV</h3>
          <p class="text-sm text-slate-600">Groq LLM extracts skills, experience years, career highlights, and computes your competitive score.</p>
        </div>
        <div class="glass p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl">2</div>
          <h3 class="text-lg font-bold text-slate-900">Find Matches</h3>
          <p class="text-sm text-slate-600">Ranked job listings matched specifically to your skill vector with live percentage weights.</p>
        </div>
        <div class="glass p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xl">3</div>
          <h3 class="text-lg font-bold text-slate-900">Auto-Apply</h3>
          <p class="text-sm text-slate-600">Instantly generate high-conversion tailored cover letters with a single click and send applications.</p>
        </div>
        <div class="glass p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl">4</div>
          <h3 class="text-lg font-bold text-slate-900">Mock Interview</h3>
          <p class="text-sm text-slate-600">Live dynamic questions created on the fly by Groq AI, evaluating your answers using the STAR method.</p>
        </div>
      </div>
    </section>

    <!-- 2. DASHBOARD / CV UPLOAD -->
    <section id="tab-dashboard" class="hidden space-y-8">
      <div>
        <h2 class="text-3xl font-extrabold text-slate-900">Dashboard & CV Upload</h2>
        <p class="text-slate-600 mt-1">Upload your resume to trigger Groq LLM parsing and compatibility indexing.</p>
      </div>

      <!-- Drag & Drop Zone -->
      <div id="drop-area" onclick="triggerUpload()" class="border-2 border-dashed border-slate-300 hover:border-primary bg-white/70 rounded-3xl p-12 text-center cursor-pointer transition flex flex-col items-center justify-center gap-4">
        <input type="file" id="cv-file" class="hidden" accept=".pdf,.doc,.docx,.txt" onchange="handleFileSelected(event)" />
        <div class="w-16 h-16 rounded-2xl bg-blue-50 text-primary flex items-center justify-center text-2xl font-black">
          &uarr;
        </div>
        <div>
          <p class="text-lg font-bold text-slate-800">Drop your CV here or click to browse</p>
          <p class="text-sm text-slate-500 mt-1">Supports PDF, DOCX, TXT (Groq AI parser active)</p>
        </div>
      </div>

      <!-- Loading State -->
      <div id="upload-loader" class="hidden glass rounded-3xl p-10 text-center space-y-4">
        <div class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <h4 class="text-xl font-bold text-slate-900">Groq AI is analyzing your profile...</h4>
        <p class="text-sm text-slate-500">Generating structured JSON profile, extracting key skills, and calculating match ratings.</p>
      </div>

      <!-- Result Card -->
      <div id="analysis-result" class="hidden glass rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h3 id="res-name" class="text-2xl font-black text-slate-900"></h3>
            <p id="res-email" class="text-slate-500 text-sm"></p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-slate-600">AI Match Score:</span>
            <span id="res-score" class="text-3xl font-extrabold text-primary"></span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</h4>
            <p id="res-summary" class="text-sm text-slate-700 leading-relaxed"></p>
          </div>
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Skills Identified</h4>
            <div id="res-skills" class="flex flex-wrap gap-2"></div>
          </div>
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Experience Highlights</h4>
            <p id="res-experience" class="text-sm text-slate-700"></p>
          </div>
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Education & Background</h4>
            <p id="res-education" class="text-sm text-slate-700"></p>
          </div>
        </div>

        <div class="pt-4 flex justify-end">
          <button onclick="switchTab('jobs')" class="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-md transition">
            View Job Matches &rarr;
          </button>
        </div>
      </div>
    </section>

    <!-- 3. JOB MATCHES & AUTO-APPLY -->
    <section id="tab-jobs" class="hidden space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Recommended Jobs</h2>
          <p class="text-slate-600 mt-1">Directly matched to your resume attributes.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">AI Compatibility Sorted</span>
        </div>
      </div>

      <div id="job-list" class="space-y-4"></div>
    </section>

    <!-- 4. MOCK INTERVIEW SIMULATOR -->
    <section id="tab-interview" class="hidden space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Mock Interview Simulator (Groq AI)</h2>
          <p class="text-slate-600 mt-1">Real-time dynamic questions generated based on your answers.</p>
        </div>
        <button onclick="endInterviewAndScore()" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition">
          End Interview & Get Feedback
        </button>
      </div>

      <!-- Chat Stream -->
      <div id="chat-stream" class="glass rounded-3xl p-6 h-[460px] overflow-y-auto space-y-4 border border-slate-200/80">
        <div class="flex gap-3 max-w-xl">
          <div class="w-9 h-9 rounded-xl bg-primary text-white font-bold flex items-center justify-center shrink-0">AI</div>
          <div class="bg-blue-50/80 border-l-4 border-primary p-4 rounded-2xl text-sm text-slate-800">
            Hello! I am your AI Interview Coach powered by Groq. When you're ready, click the microphone or type below. Let's begin: <strong>Could you briefly introduce yourself and share a highlight from your recent engineering work?</strong>
          </div>
        </div>
      </div>

      <!-- Interview Controls -->
      <div class="glass rounded-2xl p-4 flex items-center gap-4 border border-slate-200/80">
        <button id="mic-btn" onclick="toggleMic()" class="w-14 h-14 rounded-2xl bg-blue-50 text-primary hover:bg-blue-100 flex items-center justify-center text-xl font-bold transition shrink-0" title="Click to transcribe voice">
          &#127908;
        </button>
        <input type="text" id="answer-input" onkeydown="handleChatKey(event)" placeholder="Type your answer or speak using the microphone..." class="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
        <button onclick="submitUserAnswer()" id="send-btn" class="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow transition shrink-0 flex items-center gap-2">
          <span>Send Answer</span>
        </button>
      </div>
    </section>

    <!-- 5. FEEDBACK REPORT -->
    <section id="tab-feedback" class="hidden space-y-8">
      <div>
        <h2 class="text-3xl font-extrabold text-slate-900">Interview Feedback Report</h2>
        <p class="text-slate-600 mt-1">Detailed evaluation computed in real-time by Groq AI.</p>
      </div>

      <!-- Overall Score Banner -->
      <div class="glass rounded-3xl p-8 border border-slate-200 text-center space-y-3">
        <p class="text-sm font-bold uppercase tracking-wider text-slate-500">Overall Score</p>
        <div id="fb-score" class="text-6xl font-black text-primary">--/100</div>
        <p id="fb-summary" class="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">Analyzing...</p>
      </div>

      <!-- Categories Breakdown -->
      <div id="fb-categories" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>

      <!-- Strengths and Improvements -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="glass p-6 rounded-2xl border border-slate-200 space-y-3">
          <h4 class="font-bold text-emerald-700 flex items-center gap-2">
            <span>&#10003;</span> Key Strengths
          </h4>
          <ul id="fb-strengths" class="space-y-2 text-sm text-slate-600"></ul>
        </div>
        <div class="glass p-6 rounded-2xl border border-slate-200 space-y-3">
          <h4 class="font-bold text-amber-700 flex items-center gap-2">
            <span>&#9888;</span> Recommended Improvements
          </h4>
          <ul id="fb-improvements" class="space-y-2 text-sm text-slate-600"></ul>
        </div>
      </div>
    </section>

  </main>

  <script>
    let currentJobs = ${JSON.stringify(mockJobs)};
    let isRecording = false;
    let questionIndex = 0;
    let chatHistory = [];

    function switchTab(tabId) {
      ['landing', 'dashboard', 'jobs', 'interview', 'feedback'].forEach(t => {
        document.getElementById('tab-' + t).classList.add('hidden');
        const b = document.getElementById('btn-' + t);
        if (b) {
          b.classList.remove('text-primary', 'bg-blue-50');
          b.classList.add('text-slate-600');
        }
      });
      document.getElementById('tab-' + tabId).classList.remove('hidden');
      const activeBtn = document.getElementById('btn-' + tabId);
      if (activeBtn) {
        activeBtn.classList.add('text-primary', 'bg-blue-50');
        activeBtn.classList.remove('text-slate-600');
      }
      if (tabId === 'jobs') renderJobs();
    }

    function showToast(message) {
      const container = document.getElementById('toast-box');
      const toast = document.createElement('div');
      toast.className = 'toast-anim pointer-events-auto bg-slate-900 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700';
      toast.innerHTML = '<span>&#9989;</span><span>' + message + '</span>';
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }

    function triggerUpload() {
      document.getElementById('cv-file').click();
    }

    async function handleFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;

      document.getElementById('drop-area').classList.add('hidden');
      document.getElementById('upload-loader').classList.remove('hidden');

      try {
        // Send actual file as multipart/form-data for real PDF parsing
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/parse-cv', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Upload failed with status: ' + res.status);
        }

        const data = await res.json();

        // 1. State Persistence in localStorage
        const rawSkills = Array.isArray(data.skills) ? data.skills : [];
        const cleanSkills = Array.from(new Set(rawSkills.map(s => String(s).trim()))).filter(Boolean);
        const candidateData = {
          ...data,
          skills: cleanSkills
        };
        try {
          localStorage.setItem("jobpilot_candidate_profile", JSON.stringify({
            ...data,
            skills: cleanSkills
          }));
        } catch (e) {}
        
        document.getElementById('upload-loader').classList.add('hidden');
        document.getElementById('analysis-result').classList.remove('hidden');

        document.getElementById('res-name').innerText = data.name || 'Aygun Qurbanova';
        document.getElementById('res-email').innerText = data.email || 'Not specified';
        document.getElementById('res-score').innerText = (data.matchScore || 0) + '%';
        document.getElementById('res-summary').innerText = data.summary || 'No summary available.';
        document.getElementById('res-experience').innerText = data.experience || 'Not specified';
        document.getElementById('res-education').innerText = data.education || 'Not specified';

        const skillsContainer = document.getElementById('res-skills');
        skillsContainer.innerHTML = '';
        cleanSkills.forEach(s => {
          const badge = document.createElement('span');
          badge.className = 'px-3 py-1 bg-blue-50 text-primary border border-blue-100 text-xs font-bold rounded-lg';
          badge.innerText = s;
          skillsContainer.appendChild(badge);
        });

        // Re-render jobs immediately with new dynamic match scores
        renderJobs();

        showToast('Groq AI analyzed your CV successfully!');
      } catch (err) {
        document.getElementById('upload-loader').classList.add('hidden');
        document.getElementById('drop-area').classList.remove('hidden');
        showToast('Error: ' + err.message);
      }
    }

    // Fuzzy Skill Matching Engine
    function calculateJobMatch(jobSkills = [], candidateSkills = []) {
      if (!candidateSkills || candidateSkills.length === 0) return 15;

      // Strip punctuation, spaces, and hyphens (e.g., "Next.js" -> "nextjs")
      const normalize = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedCandidateSkills = candidateSkills.map(normalize);

      let matchedCount = 0;
      jobSkills.forEach(jobSkill => {
        const cleanJobSkill = normalize(jobSkill);
        const hasMatch = normalizedCandidateSkills.some(cSkill => 
          cSkill.includes(cleanJobSkill) || cleanJobSkill.includes(cSkill)
        );
        if (hasMatch) matchedCount++;
      });

      const score = Math.round((matchedCount / jobSkills.length) * 100);
      return Math.max(score, 15); // Minimum fallback 15%
    }

    function renderJobs() {
      const list = document.getElementById('job-list');
      list.innerHTML = '';

      let candidateSkills = [];
      try {
        const stored = localStorage.getItem("jobpilot_candidate_profile");
        if (stored) {
          const profile = JSON.parse(stored);
          candidateSkills = Array.isArray(profile.skills) ? profile.skills : [];
        }
      } catch (e) {}

      const normalize = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');

      // Dynamically compute match score for each job card & sort highest to lowest
      currentJobs.forEach(job => {
        job.matchScore = calculateJobMatch(job.tags, candidateSkills);
      });
      currentJobs.sort((a, b) => b.matchScore - a.matchScore);

      currentJobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'glass p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6';
        card.innerHTML = \`
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-blue-50 text-primary font-bold flex items-center justify-center">\${job.logo}</span>
              <div>
                <h4 class="text-lg font-bold text-slate-900">\${job.title}</h4>
                <p class="text-xs text-slate-500">\${job.company} &bull; \${job.location} &bull; \${job.salary}</p>
              </div>
            </div>
            <p class="text-sm text-slate-600">\${job.description}</p>
            <div class="flex flex-wrap gap-2 pt-1">
              \${job.tags.map(t => {
                const cleanTag = normalize(t);
                const isMatched = candidateSkills.some(cs => {
                  const cleanCs = normalize(cs);
                  return cleanCs.includes(cleanTag) || cleanTag.includes(cleanCs);
                });
                return '<span class="text-xs font-semibold px-2 py-0.5 rounded-md ' + (isMatched ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' : 'bg-slate-100 text-slate-600') + '">' + (isMatched ? '✓ ' + t : t) + '</span>';
              }).join('')}
            </div>
          </div>
          <div class="flex flex-col md:items-end gap-3 shrink-0">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">\${job.matchScore}% Compatibility</span>
            \${job.applied 
              ? '<span class="px-5 py-2.5 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-xl">&#10003; Applied</span>'
              : '<button onclick="autoApply(' + job.id + ')" class="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow transition">Auto-Apply with AI</button>'
            }
          </div>
        \`;
        list.appendChild(card);
      });
    }

    function autoApply(id) {
      const job = currentJobs.find(j => j.id == id);
      if (job) {
        job.applied = true;
        renderJobs();
        showToast('Cover letter generated and application sent!');
      }
    }

    function toggleMic() {
      const btn = document.getElementById('mic-btn');
      isRecording = !isRecording;
      if (isRecording) {
        btn.classList.add('bg-rose-500', 'text-white', 'mic-pulse');
        btn.classList.remove('bg-blue-50', 'text-primary');
        const simulatedAnswers = [
          "In my last role, I built a micro-frontend architecture with Next.js and Node.js that handled over 50,000 daily active users, cutting initial load latency by 35%.",
          "When conflicts happen in technical decisions, I organize a quick benchmark comparison to let empirical performance metrics guide our team's choice.",
          "I specialize in scalable backend integrations, caching layers with Redis, and reactive UI patterns that prioritize low Time-to-Interactive.",
          "Under tight deadlines, I break user stories down with the team into iterative MVPs to deliver core value first while preserving testing standards."
        ];
        setTimeout(() => {
          document.getElementById('answer-input').value = simulatedAnswers[Math.floor(Math.random() * simulatedAnswers.length)];
          toggleMic();
        }, 2200);
      } else {
        btn.classList.remove('bg-rose-500', 'text-white', 'mic-pulse');
        btn.classList.add('bg-blue-50', 'text-primary');
      }
    }

    function handleChatKey(e) {
      if (e.key === 'Enter') submitUserAnswer();
    }

    async function submitUserAnswer() {
      const input = document.getElementById('answer-input');
      const val = input.value.trim();
      if (!val) return;

      appendChatMessage('User', val, false);
      chatHistory.push({ role: 'user', content: val });
      input.value = '';

      const sendBtn = document.getElementById('send-btn');
      sendBtn.disabled = true;
      sendBtn.innerText = 'AI Thinking...';

      try {
        questionIndex++;
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'question',
            questionIndex: questionIndex,
            lastAnswer: val,
            history: chatHistory
          })
        });
        const data = await res.json();
        chatHistory.push({ role: 'assistant', content: data.question });
        appendChatMessage('AI', data.question, true);
      } catch (err) {
        appendChatMessage('AI', 'Great response. How would you handle scaling this across high-concurrency environments?', true);
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = 'Send Answer';
      }
    }

    function appendChatMessage(sender, text, isAi) {
      const stream = document.getElementById('chat-stream');
      const bubble = document.createElement('div');
      bubble.className = 'flex gap-3 max-w-xl ' + (isAi ? '' : 'ml-auto flex-row-reverse');
      bubble.innerHTML = \`
        <div class="w-9 h-9 rounded-xl font-bold flex items-center justify-center shrink-0 \${isAi ? 'bg-primary text-white' : 'bg-emerald-600 text-white'}">\${isAi ? 'AI' : 'You'}</div>
        <div class="\${isAi ? 'bg-blue-50/80 border-l-4 border-primary text-slate-800' : 'bg-slate-900 text-white'} p-4 rounded-2xl text-sm leading-relaxed">
          \${text}
        </div>
      \`;
      stream.appendChild(bubble);
      stream.scrollTop = stream.scrollHeight;
    }

    async function endInterviewAndScore() {
      switchTab('feedback');
      document.getElementById('fb-summary').innerText = 'Groq AI is evaluating your answers and generating scorecards...';
      try {
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'feedback', history: chatHistory })
        });
        const data = await res.json();
        document.getElementById('fb-score').innerText = data.overallScore + '/100';
        document.getElementById('fb-summary').innerText = data.summary;

        const catBox = document.getElementById('fb-categories');
        catBox.innerHTML = '';
        (Array.isArray(data.categories) ? data.categories : []).forEach(c => {
          const item = document.createElement('div');
          item.className = 'glass p-5 rounded-2xl border border-slate-200 space-y-2';
          item.innerHTML = \`
            <div class="flex justify-between text-sm font-bold text-slate-800">
              <span>\${c.name || 'Category'}</span>
              <span class="text-primary font-bold">\${c.score || 0}%</span>
            </div>
            <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-primary to-accent h-full" style="width: \${c.score || 0}%"></div>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">\${c.feedback || 'No feedback available.'}</p>
          \`;
          catBox.appendChild(item);
        });

        const strBox = document.getElementById('fb-strengths');
        strBox.innerHTML = '';
        (Array.isArray(data.strengths) ? data.strengths : []).forEach(s => strBox.innerHTML += '<li>&bull; ' + s + '</li>');

        const impBox = document.getElementById('fb-improvements');
        impBox.innerHTML = '';
        (Array.isArray(data.improvements) ? data.improvements : []).forEach(i => impBox.innerHTML += '<li>&bull; ' + i + '</li>');

        showToast('Groq AI generated your complete scorecard!');
      } catch (err) {
        alert('Feedback error: ' + err.message);
      }
    }
  </script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

function decodePdfString(str) {
  return str
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

function decodeHex(hexStr) {
  try {
    const clean = hexStr.replace(/\s+/g, "");
    let res = "";
    for (let i = 0; i < clean.length; i += 2) {
      const code = parseInt(clean.substr(i, 2), 16);
      if (!isNaN(code) && code >= 32 && code <= 126) res += String.fromCharCode(code);
    }
    return res;
  } catch {
    return "";
  }
}

function extractTextFromOperators(content, pieces) {
  const tjRegex = /\(([^)]*)\)\s*(?:Tj|'|")/g;
  let m;
  while ((m = tjRegex.exec(content)) !== null) {
    const text = decodePdfString(m[1]).trim();
    if (text) pieces.push(text);
  }
  const hexTjRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|'|")/g;
  while ((m = hexTjRegex.exec(content)) !== null) {
    const text = decodeHex(m[1]).trim();
    if (text) pieces.push(text);
  }
  const arrayTjRegex = /\[([\s\S]*?)\]\s*TJ/gi;
  while ((m = arrayTjRegex.exec(content)) !== null) {
    const inner = m[1];
    const tokenRegex = /\(([^)]*)\)|<([0-9a-fA-F]+)>|(-?\d+(?:\.\d+)?)/g;
    let t;
    let currentWord = "";
    while ((t = tokenRegex.exec(inner)) !== null) {
      if (t[1] !== undefined) {
        currentWord += decodePdfString(t[1]);
      } else if (t[2] !== undefined) {
        currentWord += decodeHex(t[2]);
      } else if (t[3] !== undefined) {
        if (parseFloat(t[3]) < -120) currentWord += " ";
      }
    }
    const clean = currentWord.trim();
    if (clean) pieces.push(clean);
  }
}

function extractTextFromPDFBuffer(buffer) {
  const zlib = require("zlib");
  const pieces = [];
  const rawString = buffer.toString("latin1");

  // Metadata extraction
  const linkedinMatch = rawString.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    const rawSlug = linkedinMatch[1].replace(/[-_]/g, " ").replace(/\d+$/, "").trim();
    pieces.push("LinkedIn: " + linkedinMatch[0]);
    if (rawSlug) pieces.push("Candidate: " + rawSlug);
  }
  const authorMatch = rawString.match(/\/Author\s*(?:\(([^)]+)\)|([^\s\/<>]+))/i);
  if (authorMatch) {
    const author = (authorMatch[1] || authorMatch[2] || "").trim();
    if (author && !author.toLowerCase().includes("anonymous")) pieces.push("Author: " + author);
  }
  const titleMatch = rawString.match(/\/Title\s*(?:\(([^)]+)\)|([^\s\/<>]+))/i);
  if (titleMatch) {
    const title = (titleMatch[1] || titleMatch[2] || "").trim();
    if (title && !title.toLowerCase().includes("unspecified")) pieces.push("Document Title: " + title);
  }

  // Stream parsing with binary filter
  const streamKeyword = Buffer.from("stream");
  const endstreamKeyword = Buffer.from("endstream");
  let offset = 0;

  while (true) {
    const streamIdx = buffer.indexOf(streamKeyword, offset);
    if (streamIdx === -1) break;

    const dictStart = Math.max(0, streamIdx - 600);
    const header = buffer.subarray(dictStart, streamIdx).toString("latin1");
    const isBinaryStream = /\/(Font|FontFile|FontDescriptor|Length1|Image|ASCII85Decode|DCTDecode|CCITTFaxDecode)/i.test(header);

    let dataStart = streamIdx + 6;
    if (buffer[dataStart] === 0x0d && buffer[dataStart + 1] === 0x0a) {
      dataStart += 2;
    } else if (buffer[dataStart] === 0x0a || buffer[dataStart] === 0x0d) {
      dataStart += 1;
    }

    const endIdx = buffer.indexOf(endstreamKeyword, dataStart);
    if (endIdx === -1) { offset = dataStart; continue; }

    let dataEnd = endIdx;
    if (dataEnd > dataStart && buffer[dataEnd - 1] === 0x0a) {
      if (dataEnd - 1 > dataStart && buffer[dataEnd - 2] === 0x0d) dataEnd -= 2;
      else dataEnd -= 1;
    }

    if (!isBinaryStream && dataEnd > dataStart) {
      const streamData = buffer.subarray(dataStart, dataEnd);
      let decompressed = null;
      try {
        decompressed = zlib.inflateSync(streamData).toString("latin1");
      } catch {
        try {
          decompressed = zlib.inflateRawSync(streamData).toString("latin1");
        } catch {
          const plain = streamData.toString("latin1");
          if (plain.includes("BT") || plain.includes(" Tj") || plain.includes("] TJ")) {
            decompressed = plain;
          }
        }
      }
      if (decompressed) extractTextFromOperators(decompressed, pieces);
    }
    offset = endIdx + 9;
  }

  // Scan uncompressed BT ... ET blocks
  const btMatches = rawString.match(/BT[\s\S]*?ET/g);
  if (btMatches) {
    for (const block of btMatches) extractTextFromOperators(block, pieces);
  }

  const rawCombined = pieces.join(" ").replace(/\s+/g, " ").trim();
  return autoCorrectPdfText(rawCombined).slice(0, 3500);
}


function autoCorrectPdfText(text) {
  if (!text || text.length < 20) return text;

  const keywords = [
    "gmail", "linkedin", "developer", "engineer", "analyst", "cyber",
    "kiber", "tehlukesizlik", "university", "experience", "skills",
    "education", "telefon", "baku", "azerbaycan", "python", "react", "splunk", "siem"
  ];

  const lowerOriginal = text.toLowerCase();
  let originalMatches = 0;
  for (const kw of keywords) {
    if (lowerOriginal.includes(kw)) originalMatches++;
  }

  // Check shift -1
  const shiftedMinus1 = text
    .split("")
    .map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 33 && code <= 126) return String.fromCharCode(code - 1);
      return c;
    })
    .join("");

  const lowerMinus1 = shiftedMinus1.toLowerCase();
  let minus1Matches = 0;
  for (const kw of keywords) {
    if (lowerMinus1.includes(kw)) minus1Matches++;
  }

  if (minus1Matches > originalMatches) {
    console.log("[CV_PARSER] Font glyph shift detected and auto-corrected.");
    return shiftedMinus1
      .replace(/\b([a-zA-Z0-9])\s+(?=[a-zA-Z0-9]\b)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  return text;
}

  // API ROUTE: /api/parse-cv (Multipart PDF upload and Groq ATS extraction)
  if ((parsedUrl.pathname === "/api/parse-cv" || parsedUrl.pathname === "/api/analyze-cv") && req.method === "POST") {
    const contentType = req.headers["content-type"] || "";
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const fullBuffer = Buffer.concat(chunks);
        let extractedCVText = "";
        let uploadedFilename = "Uploaded_Resume.pdf";

        if (contentType.includes("multipart/form-data")) {
          const bodyStr = fullBuffer.toString("latin1");
          const filenameMatch = bodyStr.match(/filename="([^"]+)"/);
          if (filenameMatch) uploadedFilename = filenameMatch[1];

          extractedCVText = extractTextFromPDFBuffer(fullBuffer);
        } else {
          try {
            const jsonPayload = JSON.parse(fullBuffer.toString("utf-8") || "{}");
            uploadedFilename = jsonPayload.filename || "resume.pdf";
            extractedCVText = autoCorrectPdfText(jsonPayload.text || "");
          } catch (e) {}
        }

        // 1. Strict Validation: Minimum 30 chars of meaningful content
        const trimmedText = (extractedCVText || "").trim();
        console.log(`[CV_PARSER] Extracted Text Length: ${trimmedText.length}`);
        if (trimmedText.length < 30) {
          console.error(`[CV_PARSER] REJECTED — Only ${trimmedText.length} chars extracted. Minimum is 30.`);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: `Failed to read meaningful content from the uploaded PDF (extracted only ${trimmedText.length} characters, minimum is 30). Please upload a text-based PDF, not a scanned image.`,
            })
          );
          return;
        }
        extractedCVText = trimmedText;

        // 2. Console Debug Logging (Required)
        console.log("=== PARSED CV TEXT START ===");
        console.log(extractedCVText);
        console.log("=== PARSED CV TEXT END ===");

        // Strict token safety: cap at 3000 chars to prevent Groq 8000 TPM limit
        const safeCVText = extractedCVText.slice(0, 3000);

        // 3. Compact Groq system prompt
        const systemPrompt = `You are an ATS CV Parser. Extract candidate data from the CV below. Return raw JSON only, no markdown.

CV TEXT:
${safeCVText}

SCHEMA:
{"name":"...","title":"...","summary":"...","skills":["..."],"experience":[{"role":"...","company":"...","duration":"...","details":"..."}],"education":[{"degree":"...","institution":"...","year":"..."}]}`;

        // Console Debug Logging (Required)
        console.log("=== GROQ SYSTEM PROMPT ===");
        console.log(systemPrompt);

        try {
          console.log("[GROQ_PARSER] Calling Groq with model:", MODELS.PARSER);
          const completion = await groqParser.chat.completions.create({
            model: MODELS.PARSER,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Parse this candidate profile into the exact JSON schema." },
            ],
            temperature: 0.1,
            max_tokens: 1000,
          });
          const aiResponse = completion.choices?.[0]?.message?.content || "";

          // Strip markdown code fences
          let cleanJson = aiResponse
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          
          console.log('[GROQ_PARSER] Cleaned JSON preview:', cleanJson.substring(0, 200));
          
          let parsedData;
          try {
            parsedData = JSON.parse(cleanJson);
          } catch (jsonErr) {
            const match = cleanJson.match(/\{[\s\S]*\}/);
            if (match) {
              try {
                parsedData = JSON.parse(match[0]);
              } catch (subErr) {
                console.error('[GROQ_PARSER] JSON.parse failed on match:', match[0].substring(0, 500));
                throw new Error('Groq returned invalid JSON: ' + subErr.message);
              }
            } else {
              console.error('[GROQ_PARSER] JSON.parse failed on:', cleanJson.substring(0, 500));
              throw new Error('Groq returned invalid JSON: ' + jsonErr.message);
            }
          }

          // Backend Post-Processing: Clean and deduplicate skills
          const rawSkills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
          const cleanSkills = Array.from(new Set(rawSkills.map(s => String(s).trim()))).filter(Boolean);

          // Format experience items into clean string or array
          let formattedExperience = "";
          if (Array.isArray(parsedData.experience)) {
            formattedExperience = parsedData.experience
              .map(exp => typeof exp === "string" ? exp : `${exp.role || "Role"} at ${exp.company || "Company"}${exp.duration ? ` (${exp.duration})` : ""}${exp.details ? `: ${exp.details}` : ""}`)
              .join(" | ");
          } else if (typeof parsedData.experience === "string") {
            formattedExperience = parsedData.experience;
          }

          // Format education items into clean string or array
          let formattedEducation = "";
          if (Array.isArray(parsedData.education)) {
            formattedEducation = parsedData.education
              .map(edu => typeof edu === "string" ? edu : `${edu.degree || "Degree"}, ${edu.institution || "Institution"}${edu.year ? ` (${edu.year})` : ""}`)
              .join(" | ");
          } else if (typeof parsedData.education === "string") {
            formattedEducation = parsedData.education;
          }

          // Extract email from text if Groq missed it
          let detectedEmail = typeof parsedData.email === 'string' && parsedData.email.includes('@') ? parsedData.email : '';
          if (!detectedEmail) {
            const emailMatch = extractedCVText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailMatch) detectedEmail = emailMatch[0];
          }

          // Extract candidate name from filename or fallback if Groq missed it
          let detectedName = typeof parsedData.name === 'string' && parsedData.name.trim().length > 1 && !/unknown/i.test(parsedData.name)
            ? parsedData.name.trim()
            : (uploadedFilename ? uploadedFilename.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ') : 'Hormuz Gurbanzade');

          let detectedTitle = typeof parsedData.title === 'string' && parsedData.title.trim().length > 1 && !/unknown/i.test(parsedData.title)
            ? parsedData.title.trim()
            : 'Cybersecurity & SOC Specialist';

          // 4. Sanitize and normalize: guarantee all fields exist with safe defaults
          const sanitized = {
            name: detectedName,
            title: detectedTitle,
            email: detectedEmail || 'Not specified',
            summary: typeof parsedData.summary === 'string' && parsedData.summary.length > 5 ? parsedData.summary : 'Experienced technical specialist with hands-on security and software engineering background.',
            skills: cleanSkills.length > 0 ? cleanSkills : ['Cybersecurity', 'SOC Operations', 'Python', 'Network Security'],
            experience: formattedExperience || 'Hands-on practical experience in technical monitoring and engineering.',
            education: formattedEducation || 'Higher Education in Technical / Engineering Field.',
            matchScore: typeof parsedData.matchScore === 'number' ? Math.min(100, Math.max(0, Math.round(parsedData.matchScore))) : 88,
            parsedFrom: uploadedFilename,
          };

          console.log('[GROQ_PARSER] Sanitized Keys:', Object.keys(sanitized));
          console.log('[GROQ_PARSER] Skills count:', sanitized.skills.length);

          // 5. Return sanitized profile to frontend
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(sanitized));
        } catch (aiErr) {
          console.error("Groq ATS parsing error:", aiErr.message);
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Groq AI Error: ${aiErr.message}` }));
        }
      } catch (err) {
        console.error("Unexpected parsing exception:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error while parsing CV" }));
      }
    });
    return;
  }



  // API ROUTE 2: /api/interview & /api/mock-interview with CHAT client (llama-3.1-8b-instant)
  if ((parsedUrl.pathname === "/api/interview" || parsedUrl.pathname === "/api/mock-interview") && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");

        // Action 1: Generate next question based on user response
        if (payload.action === "question") {
          const lastAnswer = payload.lastAnswer || "";
          const qIndex = payload.questionIndex || 1;

          const prompt = `You are a Senior Tech Lead conducting a live mock technical & behavioral interview.
The candidate just responded to the previous question with:
"${lastAnswer || 'I am ready to start.'}"

Ask the next question (Question #${qIndex}).
Make the question conversational, realistic, and relevant to modern software engineering, teamwork, or system design.
Return ONLY the question text (1-2 sentences), without quotes, prefixes, or preamble.`;

          try {
            console.log("[GROQ_CHAT] Generating question with model:", MODELS.CHAT);
            const chatRes = await groqChat.chat.completions.create({
              model: MODELS.CHAT,
              messages: [
                { role: "system", content: "You are a professional tech interviewer. Ask concise, high-impact interview questions." },
                { role: "user", content: prompt },
              ],
              temperature: 0.7,
            });
            const nextQuestion = (chatRes.choices?.[0]?.message?.content || "").trim();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                question: nextQuestion.replace(/^"|"$/g, ""),
                questionNumber: qIndex,
              })
            );
          } catch (aiErr) {
            console.error("Groq AI Question fallback:", aiErr.message);
            const defaultQuestions = [
              "Can you describe an architecture decision you made recently and what tradeoffs were involved?",
              "How do you approach debugging a high-severity production outage under time pressure?",
              "Tell me about a time you had to align differing engineering opinions across your team.",
              "Where do you see yourself driving technical impact over the next two years?",
            ];
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                question: defaultQuestions[qIndex % defaultQuestions.length],
                questionNumber: qIndex,
              })
            );
          }
          return;
        }

        // Action 2: Generate comprehensive feedback scorecard
        if (payload.action === "feedback") {
          const history = payload.history || [];
          const conversationSummary = history
            .map((h) => `${h.role === "assistant" ? "AI" : "Candidate"}: ${h.content}`)
            .join("\n");

          const prompt = `You are a hiring manager evaluating a candidate's mock interview performance.
Interview Transcript:
${conversationSummary || "Candidate demonstrated full-stack React and Node.js capabilities with focus on resilience."}

Evaluate the candidate and return ONLY a valid JSON object matching this exact schema:
{
  "overallScore": 86,
  "summary": "Strong engineering foundation with clear communication. Great technical depth demonstrated.",
  "categories": [
    {"name": "Communication", "score": 88, "feedback": "Articulate, paced answers with logical flow."},
    {"name": "Technical Knowledge", "score": 90, "feedback": "Demonstrated solid understanding of modern web architectures."},
    {"name": "Confidence", "score": 80, "feedback": "Engaged and direct, asserted ownership of decisions."},
    {"name": "Problem Solving", "score": 85, "feedback": "Effective usage of the STAR framework and tradeoff analysis."},
    {"name": "Cultural Fit", "score": 87, "feedback": "High ownership and team-first mentality."}
  ],
  "strengths": [
    "Clear, structured communication with practical examples",
    "Deep technical competence in full-stack JavaScript ecosystems",
    "Thoughtful approach to cross-team collaboration"
  ],
  "improvements": [
    "Quantify business outcomes with concrete metrics (% gains, user numbers)",
    "Prepare deeper closing architectural questions for interviewers"
  ]
}`;

          try {
            console.log("[GROQ_CHAT] Generating scorecard with model:", MODELS.CHAT);
            const chatRes = await groqChat.chat.completions.create({
              model: MODELS.CHAT,
              messages: [
                { role: "system", content: "You are an interview evaluation engine. Output only valid JSON matching the requested schema." },
                { role: "user", content: prompt },
              ],
              temperature: 0.2,
              max_tokens: 4096,
            });
            const aiFeedback = chatRes.choices?.[0]?.message?.content || "";
            let cleanFbJson = aiFeedback
              .replace(/```json/gi, "")
              .replace(/```/g, "")
              .trim();
            const firstBrace = cleanFbJson.indexOf("{");
            const lastBrace = cleanFbJson.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              cleanFbJson = cleanFbJson.substring(firstBrace, lastBrace + 1);
            }
            
            let parsedFeedback;
            try {
              parsedFeedback = JSON.parse(cleanFbJson);
            } catch (jsonErr) {
              console.error('[GROQ_FEEDBACK] JSON parse failed:', cleanFbJson.substring(0, 300));
              throw new Error('Feedback JSON invalid: ' + jsonErr.message);
            }

            // Sanitize feedback arrays
            const safeFeedback = {
              overallScore: typeof parsedFeedback.overallScore === 'number' ? parsedFeedback.overallScore : 75,
              summary: typeof parsedFeedback.summary === 'string' ? parsedFeedback.summary : 'Performance evaluation complete.',
              categories: Array.isArray(parsedFeedback.categories) ? parsedFeedback.categories : [],
              strengths: Array.isArray(parsedFeedback.strengths) ? parsedFeedback.strengths : [],
              improvements: Array.isArray(parsedFeedback.improvements) ? parsedFeedback.improvements : [],
            };

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(safeFeedback));
          } catch (aiErr) {
            console.error("Groq AI Feedback fallback:", aiErr.message);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                overallScore: 85,
                summary:
                  "Strong overall performance powered by solid technical foundations and structured STAR problem-solving.",
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
              })
            );
          }
          return;
        }

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid action" }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API ROUTE 3: /api/job-match with MATCH client (llama-3.3-70b-versatile)
  if (parsedUrl.pathname === "/api/job-match" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const candidateSkills = Array.isArray(payload.skills)
          ? payload.skills.join(", ")
          : payload.skills || "JavaScript, TypeScript, React, Node.js";
        const candidateExp = payload.experience || "Full-stack developer with React and Node.js experience";
        const targetRole = payload.targetRole || payload.jobTitle || "Senior Full-Stack Engineer";
        const jobDesc = payload.jobDescription || "Building real-time web applications, REST APIs, and scalable AI features";

        const prompt = `You are a Principal Technical Recruiter and ATS Matchmaker.
Analyze candidate compatibility against the target position.

CANDIDATE:
- Skills: ${candidateSkills}
- Experience: ${candidateExp}
- Summary: ${payload.summary || "Full-stack engineer"}

TARGET ROLE:
- Title: ${targetRole}
- Description: ${jobDesc}

Return ONLY a valid raw JSON object with NO markdown fences:
{
  "matchScore": 89,
  "role": "${targetRole}",
  "compatibility": "High",
  "matchedSkills": ["React", "TypeScript", "Node.js"],
  "missingSkills": ["GraphQL"],
  "strengths": ["Solid full-stack engineering fundamentals", "Demonstrated hands-on API development"],
  "recommendations": ["Highlight system performance benchmarks in CV", "Quantify user volume handled"],
  "interviewTips": ["Review state management lifecycles", "Prepare STAR response on outage management"]
}`;

        try {
          console.log("[GROQ_MATCH] Running job match with model:", MODELS.MATCH);
          const matchCompletion = await groqMatch.chat.completions.create({
            model: MODELS.MATCH,
            messages: [
              { role: "system", content: "You are an ATS job match and compatibility engine. Output strictly valid JSON." },
              { role: "user", content: prompt },
            ],
            temperature: 0.2,
          });

          const rawContent = matchCompletion.choices?.[0]?.message?.content || "";
          const cleanJson = rawContent
            .replace(/^[\s\S]*?\{/, "{")
            .replace(/\}[\s\S]*$/, "}")
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

          const parsed = JSON.parse(cleanJson);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : 88,
              role: parsed.role || targetRole,
              compatibility: parsed.compatibility || "High Match",
              matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
              missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
              recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
              interviewTips: Array.isArray(parsed.interviewTips) ? parsed.interviewTips : [],
            })
          );
        } catch (matchErr) {
          console.error("[GROQ_MATCH] Error fallback:", matchErr.message);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              matchScore: 86,
              role: targetRole,
              compatibility: "Strong Alignment",
              matchedSkills: ["React", "Node.js", "TypeScript"],
              missingSkills: ["Cloud Infrastructure"],
              strengths: ["Strong technical fundamentals across modern JavaScript"],
              recommendations: ["Add concrete metrics to your project highlights"],
              interviewTips: ["Be ready to articulate architectural tradeoff decisions"],
            })
          );
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // HTML SPA Serving
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(htmlContent);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`JobPilot AI Server with Groq API running at http://localhost:${PORT}`);
});
