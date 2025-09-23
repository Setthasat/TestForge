// parse res (format response form AI)
export function parseAIResponse(text: string) {
  const raw = text.replace(/\r/g, ""); // prevent windows newline
  const [questionsText, answersText] = raw.split(/##\s*Encoded Answers:/i); // split question and answer part
  const questions: { id: string; text: string; options: string[] }[] = []; // put question in array
  const parts = questionsText.split(/\*\*Question\s*\d+\:\*\*|\n\d+\./g); // split block "**Question X:**" or "X."
  const qMatches = questionsText.match(/\*\*Question\s*(\d+)\:\*\*|\n(\d+)\./g) || []; // find match question for get choice number

  qMatches.forEach((q, idx) => {
    const qid = (q.match(/\d+/) || [""])[0]; // find choice index
    const block = parts[idx + 1]?.trim() || ""; // find text after choice index

    const [firstLine, ...rest] = block.split("\n"); // split question and options
    const qText = firstLine.trim(); //trim question

    const options: string[] = [];
    // map A, B, C, D option
    rest.forEach((line) => {
      const m = line.match(/^([A-D])\)\s+(.+)/);
      if (m) options.push(`${m[1]}) ${m[2]}`);
    });
    //  id + question text + options to array when finish map
    if (qid && qText && options.length > 0) {
      questions.push({ id: qid, text: qText, options });
    }
  });

  // keep correct answer
  const answers: Record<string, string> = {};
  if (answersText) {
    const lines = answersText.trim().split(/\n+/); // split each line
    lines.forEach((line) => {
      try {
        const decoded = atob(line.trim()); // base64 -> "1-A"
        const [qid, choice] = decoded.split("-");
        if (qid && choice && /^[A-D]$/.test(choice.trim().toUpperCase())) {
          answers[qid] = choice.trim().toUpperCase(); // put answer to obj {1 : "A"}
        }
      } catch {} // pass if can't decode
    });
  }

  return { questions, answers };
}
