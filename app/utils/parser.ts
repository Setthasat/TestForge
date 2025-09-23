export function parseAIResponse(text: string) {

  const raw = text.replace(/\r/g, "");
  const [questionsText, answersText] = raw.split(/##\s*Encoded Answers:/i);
  const questions: { id: string; text: string; options: string[] }[] = [];
  const parts = questionsText.split(/\*\*Question\s*\d+\:\*\*|\n\d+\./g);
  const qMatches = questionsText.match(/\*\*Question\s*(\d+)\:\*\*|\n(\d+)\./g) || [];

  qMatches.forEach((q, idx) => {
    const qid = (q.match(/\d+/) || [""])[0];
    const block = parts[idx + 1]?.trim() || "";

    const [firstLine, ...rest] = block.split("\n");
    const qText = firstLine.trim();

    const options: string[] = [];
    rest.forEach((line) => {
      const m = line.match(/^([A-D])\)\s+(.+)/);
      if (m) options.push(`${m[1]}) ${m[2]}`);
    });

    if (qid && qText && options.length > 0) {
      questions.push({ id: qid, text: qText, options });
    }
  });

  const answers: Record<string, string> = {};
  if (answersText) {
    const lines = answersText.trim().split(/\n+/);
    lines.forEach((line) => {
      try {
        const decoded = atob(line.trim());
        const [qid, choice] = decoded.split("-");
        if (qid && choice && /^[A-D]$/.test(choice.trim().toUpperCase())) {
          answers[qid] = choice.trim().toUpperCase();
        }
      } catch {
      }
    });
  }

  return { questions, answers };
}
