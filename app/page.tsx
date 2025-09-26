"use client";
import Chatgpt from "../public/Chatgpt.png";
import Claude from "../public/Claude.png";
import { useState } from "react";
import {
  BookOpen,
  Copy,
  ChevronRight,
  Brain,
  Users,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";

const generatePrompt = (topic: string): string => {
  if (!topic.trim()) return "";

  return `
You are to generate a multiple-choice mock test.

Topic: ${topic}

🟡 STRICT RULES (DO NOT BREAK):
1. Write EXACTLY 10 questions.
2. Each question MUST be numbered and formatted like:
   **Question 1:** What is JavaScript?
   A) Option A
   B) Option B
   C) Option C
   D) Option D
3. Always provide **exactly 4 options** labeled A)–D).
4. Do NOT show the answer key directly.
5. At the end, under a section titled "## Encoded Answers:", provide the correct answers encoded in Base64.
   - Format before encoding: strictly "[QuestionNumber]-[Letter]" (dash only, no spaces, no dot).
     ✅ Example: "1-C" → encode → "MS1D"
     ✅ Example: "10-B" → encode → "MTAtQg=="
   - NEVER use dot, colon, parenthesis, or extra symbols (❌ "10.B" ❌ "10:B" ❌ "10)B").
6. Encode EACH answer separately in Base64, one per line.
   - Do NOT join them with commas or spaces.
   - Do NOT forget padding "=" when required.
7. If a question number is 10, it must encode as "MTAtX" form, NOT "MTAuX".
8. Only output in this format. No explanations, no markdown outside the required format.

---

# ${topic} Mock Test

**Instructions:** Choose the best answer for each question. Select A, B, C, or D.

---
(questions here)

---

## Encoded Answers:
(one base64 token per line, no commas, no spaces)
  `.trim();
};


export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleGeneratePrompt = () => {
    if (!topic.trim()) {
      setMsg("⚠️ Please enter a topic.");
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    const newPrompt = generatePrompt(topic);
    setPrompt(newPrompt);
    setMsg("✅ Prompt generated successfully!");
    setTimeout(() => setMsg(null), 4000);
  };

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setMsg("📋 Prompt copied to clipboard!");
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* 🔹 Navbar */}
      <nav className="bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="w-8 h-8 text-yellow-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                TestForge
              </span>
            </div>
            <div className="flex space-x-1 sm:space-x-4">
              <button
                onClick={() => router.push("/test")}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-yellow-400/20 text-yellow-400 shadow-lg hover:bg-yellow-400/30 transition-all"
              >
                Test
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 🔹 Page Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Message */}
        {msg && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-3 text-center text-sm font-medium shadow-lg animate-slideDown">
            {msg}
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Create Amazing
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent block sm:inline sm:ml-3">
              Mock Tests
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Generate AI-powered mock test prompts with encoded answers. Perfect
            for students, educators, and lifelong learners.
          </p>
        </div>

        {/* 🔹 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-yellow-400/20">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 rounded-lg flex items-center justify-center mb-4 border border-yellow-400/30">
              <Brain className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-gray-400 text-sm">
              Generate intelligent quiz questions using advanced AI prompts.
            </p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-yellow-400/20">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 rounded-lg flex items-center justify-center mb-4 border border-yellow-400/30">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Easy to Use</h3>
            <p className="text-gray-400 text-sm">
              Sleek dark interface designed for modern educators and students.
            </p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-yellow-400/20">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 rounded-lg flex items-center justify-center mb-4 border border-yellow-400/30">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Instant Results</h3>
            <p className="text-gray-400 text-sm">
              Get immediate scoring and feedback with a beautiful dark theme.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Create Your Prompt
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-2">
                Test Topic
              </label>
              <input
                className="w-full bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="e.g., World War II, JavaScript Basics, Photosynthesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGeneratePrompt}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-yellow-400/30"
              >
                <BookOpen className="w-4 h-4" />
                <span>Generate Prompt</span>
              </button>
              <button
                onClick={() => router.push("/test")}
                className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-600 hover:border-yellow-400/50"
              >
                <span>Go to Test</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Generated Prompt */}
        {prompt && (
          <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Generated Prompt</h2>
              <button
                onClick={handleCopy}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-green-500/30"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-600">
              <textarea
                readOnly
                className="w-full bg-transparent border-none resize-none focus:outline-none text-sm text-gray-300 font-mono"
                rows={10}
                value={prompt}
              />
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Copy this prompt and use it with your preferred AI assistant, then
              paste the response in the Test page.
            </p>
            <div className="mt-2 flex gap-2">
              <a
                href="https://chatgpt.com/?model=auto"
                target="_blank"
                className="py-2 w-[24%] bg-[#74AA9C] rounded-lg cursor-pointer flex justify-center items-center gap-3"
              >
                <img src={Chatgpt.src} className="w-8 h-8" />
                ChatGPT
              </a>
              <a
                href="https://claude.ai/new"
                target="_blank"
                className="py-2 w-[24%] bg-[#da7756] rounded-lg cursor-pointer flex justify-center items-center gap-3"
              >
                <img src={Claude.src} className="w-8 h-8" />
                Claude
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-3 -mb-4">
              * Remember AI could make a mistake
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
