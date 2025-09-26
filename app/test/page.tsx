"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Trophy,
  Brain,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  number: number;
  text: string;
  options: string[];
}

export default function TestPage() {
  const [rawText, setRawText] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedOnce, setParsedOnce] = useState(false); // ✅ new state
  const router = useRouter();

  // Parse and normalize encoded answers
  const parseResponse = () => {
    setParsedOnce(true); // ✅ mark parse attempt

    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const qList: Question[] = [];
    const answersMap = new Map<number, string>();

    let qNum = 1;
    let foundEncodedHeader = false;

    const resetState = () => {
      setQuestions([]);
      setAnswers([]);
      setResponses({});
      setSubmitted(false);
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match questions
      const qMatch = line.match(/^(?:\*\*)?Question\s*(\d+):?\**\s*(.*)$/i);
      if (qMatch) {
        let text = qMatch[2].trim();
        let opts: string[] = [];

        // Case A: options inline
        if (/[A-D][\)\.]\s*/.test(text)) {
          const parts = text.split(/(?=[A-D][\)\.]\s*)/);
          text = parts.shift()!.trim();
          opts = parts.map((p) => p.replace(/^[A-D][\)\.]\s*/i, "").trim());
        }

        // Case B: options on next 4 lines
        if (opts.length === 0) {
          const tmp: string[] = [];
          for (let j = 1; j <= 4; j++) {
            const optLine = lines[i + j];
            const optMatch = optLine?.match(/^[A-D][\)\.]?\s*(.*)$/i);
            if (optMatch) tmp.push(optMatch[1]);
          }
          if (tmp.length === 4) {
            opts = tmp;
            i += 4;
          }
        }

        if (opts.length === 4) {
          qList.push({ number: qNum, text, options: opts });
          qNum++;
        }
        continue;
      }

      // Encoded Answers header
      if (/^(?:##\s*)?Encoded Answers:/i.test(line)) {
        foundEncodedHeader = true;

        const afterHeader = line
          .replace(/^(?:##\s*)?Encoded Answers:/i, "")
          .trim();
        const rest = [afterHeader, ...lines.slice(i + 1)]
          .filter(Boolean)
          .join(" ")
          .trim();

        if (!rest) {
          setError("Encoded Answers header found but no tokens provided.");
          resetState();
          return;
        }

        const rawTokens = rest.split(/[\s,]+/).filter(Boolean);

        for (const token of rawTokens) {
          let clean = token.trim().replace(/[^A-Za-z0-9+/=]/g, "");
          while (clean.length % 4 !== 0) clean += "=";

          let decoded = "";
          try {
            decoded = atob(clean);
          } catch (e) {
            console.warn(" Failed to decode base64 token:", token, "->", clean);
            continue;
          }

          // Normalize decoded format
          let num: number | null = null;
          let letter: string | null = null;

          const m1 = decoded.match(/^(\d+)\s*[-\.\:\)\s]\s*([A-D])$/i);
          if (m1) {
            num = Number(m1[1]);
            letter = m1[2].toUpperCase();
          } else {
            const m2 = decoded.match(/^(\d+)([A-D])$/i);
            if (m2) {
              num = Number(m2[1]);
              letter = m2[2].toUpperCase();
            } else {
              const normalized = decoded.replace(/[^0-9A-Za-z]/g, "-");
              const parts = normalized.split("-").filter(Boolean);
              if (parts.length >= 2) {
                num = Number(parts[0]);
                letter = parts[parts.length - 1].slice(0, 1).toUpperCase();
              }
            }
          }

          if (num && letter && /^[A-D]$/.test(letter)) {
            if (answersMap.has(num)) {
              console.warn(
                " Duplicate encoded answer for question",
                num,
                "ignored."
              );
              continue;
            }
            answersMap.set(num, letter);
          } else {
            console.warn(" Ignored invalid decoded answer:", decoded);
          }
        }

        break;
      }
    }

    // Post validations
    if (!foundEncodedHeader) {
      setError(
        'Encoded Answers header not found. Please include "Encoded Answers:".'
      );
      resetState();
      return;
    }

    if (qList.length === 0) {
      setError(
        "No valid questions parsed. Ensure each question uses 'Question X:' with A)–D) options."
      );
      resetState();
      return;
    }

    for (let n = 1; n <= qList.length; n++) {
      if (!answersMap.has(n)) {
        setError(`Missing encoded answer for question ${n}.`);
        resetState();
        return;
      }
    }

    const ordered: string[] = [];
    for (let n = 1; n <= qList.length; n++) {
      ordered.push(`${n}-${answersMap.get(n)}`);
    }

    setError(null);
    setQuestions(qList);
    setAnswers(ordered);
    setResponses({});
    setSubmitted(false);
  };

  const handleOptionSelect = (qNum: number, option: string) => {
    setResponses((prev) => ({ ...prev, [qNum]: option }));
  };

  const handleSubmit = () => setSubmitted(true);

  const score = Object.keys(responses).reduce((acc, key) => {
    const qIndex = Number(key) - 1;
    const given = responses[Number(key)];
    const correct = answers[qIndex]?.split("-")[1];
    return acc + (given === correct ? 1 : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col ">
      {/* Navbar */}
      <nav className="bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-gray-700 mb-16">
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
                onClick={() => router.push("/")}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-yellow-400/20 text-yellow-400 shadow-lg hover:bg-yellow-400/30 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Input */}
      <div className="w-full flex justify-center items-center gap-6 px-6 flex-col">
        <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-700 w-[70%]">
          <div className="mb-6">
            <h1 className="text-5xl font-extrabold text-center text-yellow-400 mb-2">
              TAKE YOUR TEST
            </h1>
            <p className="text-center text-gray-400">
              Paste your AI-generated mock test below (must follow strict
              format).
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur rounded-xl p-6 shadow-lg space-y-4">
            <textarea
              className="w-full h-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              placeholder="Paste your AI response here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <button
                onClick={parseResponse}
                className="px-6 py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-300 hover:opacity-90 transition"
              >
                Parse & Start Test
              </button>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {/* ✅ Only show invalid warning after parse attempt */}
              {parsedOnce &&
                questions.length === 0 &&
                answers.length === 0 &&
                rawText &&
                !error && (
                  <p className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Format invalid — please check your AI response.
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.length > 0 && !submitted && (
          <div className="space-y-6 flex-1 w-[70%] mb-4">
            {questions.map((q) => (
              <div
                key={q.number}
                className="bg-gray-900/80 backdrop-blur p-6 rounded-xl shadow-md hover:shadow-xl transition"
              >
                <h2 className="text-lg font-semibold mb-4">
                  {q.number}. {q.text}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const selected = responses[q.number] === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => handleOptionSelect(q.number, letter)}
                        className={`p-3 rounded-lg border text-left transition ${
                          selected
                            ? "bg-yellow-500 text-black border-yellow-400 shadow-lg"
                            : "bg-gray-800 border-gray-700 hover:border-yellow-400"
                        }`}
                      >
                        <span className="font-bold">{letter})</span> {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={Object.keys(responses).length !== questions.length}
              className={`w-full px-6 py-3 rounded-lg font-bold transition ${
                Object.keys(responses).length !== questions.length
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "text-black bg-gradient-to-r from-green-400 to-emerald-400 hover:opacity-90"
              }`}
            >
              Submit Test
            </button>
          </div>
        )}

        {/* Results */}
        {submitted && (
          <div className="bg-gray-900/80 backdrop-blur p-8 rounded-xl shadow-lg space-y-6 flex-1">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-12 h-12 text-yellow-400" />
              <h2 className="text-2xl font-bold">Your Results</h2>
            </div>

            <div className="text-center">
              <p className="text-lg">Score:</p>
              <p className="text-5xl font-extrabold text-yellow-400 drop-shadow">
                {score} / {questions.length}
              </p>
              <div className="mt-4 w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-yellow-400 h-3 rounded-full transition-all"
                  style={{
                    width: `${(score / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const given = responses[q.number]; // letter (A/B/C/D)
                const correct = answers[idx]?.split("-")[1]; // correct letter
                const isCorrect = given === correct;

                // map letter -> option text
                const givenIndex = given ? given.charCodeAt(0) - 65 : -1;
                const correctIndex = correct ? correct.charCodeAt(0) - 65 : -1;

                const givenText =
                  givenIndex >= 0 ? `${given}. ${q.options[givenIndex]}` : "—";
                const correctText =
                  correctIndex >= 0
                    ? `${correct}. ${q.options[correctIndex]}`
                    : "—";

                return (
                  <div
                    key={q.number}
                    className="p-4 rounded-lg border bg-gray-800/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        {q.number}. {q.text}
                      </h3>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <p>
                      <span className="text-gray-400">Your Answer:</span>{" "}
                      {givenText}
                    </p>
                    <p>
                      <span className="text-gray-400">Correct Answer:</span>{" "}
                      {correctText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
