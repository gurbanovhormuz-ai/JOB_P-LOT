const fs = require("fs");
const path = require("path");

// Ensure environment variables from .env.local and .env are loaded
function loadEnv() {
  const root = process.cwd();
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(root, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        content.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const idx = trimmed.indexOf("=");
            if (idx !== -1) {
              const key = trimmed.substring(0, idx).trim();
              const val = trimmed.substring(idx + 1).trim();
              if (val && !process.env[key]) {
                process.env[key] = val;
              }
            }
          }
        });
      } catch (err) {
        console.warn(`Could not load ${file}:`, err.message);
      }
    }
  }
}

// Load env on module import
loadEnv();

// Intelligent model fallback map in case specified model is not supported on endpoint
const MODEL_FALLBACKS = {
  "llama-3.3-70b-versatile": ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b"],
  "llama-3.1-8b-instant": ["llama-3.1-8b-instant", "openai/gpt-oss-20b", "openai/gpt-oss-120b"],
  "llama3-70b-8192": ["llama3-70b-8192", "openai/gpt-oss-120b", "openai/gpt-oss-20b"],
  "llama3-8b-8192": ["llama3-8b-8192", "openai/gpt-oss-20b"],
};

/**
 * Universal Groq SDK Client implementation
 * Fully compatible with official groq-sdk API signature:
 * client.chat.completions.create({ model, messages, temperature })
 */
class Groq {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.GROQ_API_KEY;
    if (!this.apiKey) {
      console.warn("[Groq Client] Warning: Initialized without an API key.");
    }

    this.chat = {
      completions: {
        create: async ({
          model = "llama-3.3-70b-versatile",
          messages = [],
          temperature = 0.7,
          max_tokens = 2048,
          response_format,
        }) => {
          const candidateModels = MODEL_FALLBACKS[model] || [model, "openai/gpt-oss-20b"];
          let lastError = null;

          for (const currentModel of candidateModels) {
            try {
              const payload = {
                model: currentModel,
                messages,
                temperature,
                max_tokens,
              };
              if (response_format) payload.response_format = response_format;

              const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${this.apiKey}`,
                  "Content-Type": "application/json",
                  "User-Agent": "JobPilot-AI/1.0",
                },
                body: JSON.stringify(payload),
              });

              if (response.status === 404) {
                const errBody = await response.text();
                lastError = new Error(`Model ${currentModel} not available (404)`);
                continue;
              }

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq API returned HTTP ${response.status}: ${errorText}`);
              }

              return await response.json();
            } catch (err) {
              if (err.message && err.message.includes("404")) {
                lastError = err;
                continue;
              }
              throw err;
            }
          }

          throw lastError || new Error(`No available Groq model found for request ${model}`);
        },
      },
    };
  }
}

// Key helper functions with fallback to GROQ_API_KEY
const getParserKey = () =>
  process.env.GROQ_API_KEY_PARSER || process.env.GROQ_API_KEY || "";

const getChatKey = () =>
  process.env.GROQ_API_KEY_CHAT || process.env.GROQ_API_KEY || "";

const getMatchKey = () =>
  process.env.GROQ_API_KEY_MATCH || process.env.GROQ_API_KEY || "";

// Factory methods
function getParserClient() {
  return new Groq({ apiKey: getParserKey() });
}

function getChatClient() {
  return new Groq({ apiKey: getChatKey() });
}

function getMatchClient() {
  return new Groq({ apiKey: getMatchKey() });
}

// Proxied clients dynamically evaluate keys on every invocation
function createDynamicClient(getKeyFn) {
  return {
    chat: {
      completions: {
        create: async (args) => {
          const client = new Groq({ apiKey: getKeyFn() });
          return await client.chat.completions.create(args);
        },
      },
    },
  };
}

const groqParser = createDynamicClient(getParserKey);
const groqChat = createDynamicClient(getChatKey);
const groqMatch = createDynamicClient(getMatchKey);

// Recommended models per route
const MODELS = {
  PARSER: "llama-3.3-70b-versatile",
  CHAT: "llama-3.1-8b-instant",
  MATCH: "llama-3.3-70b-versatile",
};

module.exports = {
  Groq,
  groqParser,
  groqChat,
  groqMatch,
  getParserClient,
  getChatClient,
  getMatchClient,
  MODELS,
  loadEnv,
};

module.exports.default = Groq;
