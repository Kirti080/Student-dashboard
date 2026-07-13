const { generateAssistantReply } = require("../services/aiService");

const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: "At least one message is required",
      });
    }

    const sanitizedMessages = messages
      .slice(-20)
      .filter(
        (message) =>
          ["user", "assistant"].includes(message.role) &&
          typeof message.content === "string"
      )
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 4000),
      }));

    if (sanitizedMessages.length === 0 || sanitizedMessages.every((message) => !message.content)) {
      return res.status(400).json({
        message: "A valid message is required",
      });
    }

    const reply = await generateAssistantReply(
      sanitizedMessages,
      req.user
    );

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    if (error?.status === 429 && error?.code === "insufficient_quota") {
      console.warn("AI Chat unavailable: OpenAI API quota is exhausted or billing is not enabled.");

      return res.status(429).json({
        code: "AI_QUOTA_EXCEEDED",
        message: "The AI assistant has no available API quota. Please check the OpenAI API billing balance.",
      });
    }

    if (error?.status === 429) {
      console.warn("AI Chat rate limit reached:", error.message);

      return res.status(429).json({
        code: "AI_RATE_LIMITED",
        message: "The AI assistant is receiving too many requests. Please wait a moment and try again.",
      });
    }

    console.error("AI Chat Error:", error?.message || error);

    return res.status(500).json({
      code: "AI_REQUEST_FAILED",
      message: "Unable to generate an AI response",
    });
  }
};

module.exports = {
  chat,
};
