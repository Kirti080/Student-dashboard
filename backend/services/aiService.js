const OpenAI = require("openai");

const generateAssistantReply = async (messages, student) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",

  });

  const response = await groq.responses.create({
    model: process.env.GROQ_MODEL || "llama3-8b-8192",

    instructions: `
You are an AI assistant inside a student academic portal.

Student:
Name: ${student.name}
Program: ${student.program || "Not provided"}
Semester: ${student.semester || "Not provided"}

Your responsibilities:
-Greet the student by name first.
- Help with studying, assignments and academic planning.
- Explain concepts clearly and step by step.
- Keep answers concise unless the student requests detail.
- Do not invent marks, attendance, deadlines or course information.
- If information is unavailable, clearly say so.
- Do not provide answers that enable academic cheating.
`,

    input: messages,
  });

  return response.output_text;
};

module.exports = {
  generateAssistantReply,
};
