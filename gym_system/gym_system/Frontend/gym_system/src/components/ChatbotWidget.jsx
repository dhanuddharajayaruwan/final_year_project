import React, { useState, useRef, useEffect } from "react";
import chatbotService from "../services/chatbot.service";
import ReactMarkdown from "react-markdown";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! Ask me any questions about Cylon Force Gym.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openChatbot", handler);
    return () => window.removeEventListener("openChatbot", handler);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputValue("");
    setIsLoading(true);

    const lowerMsg = userMsg
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

    // Hardcoded responses for greetings
    if (lowerMsg === "hi" || lowerMsg === "hello") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Hi! How can I help you today?" },
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    // Hardcoded responses for thank yous
    if (lowerMsg === "thank you" || lowerMsg === "thanks") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "You are welcome! Let me know if you need anything else.",
          },
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await chatbotService.queryChatbot(userMsg);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.answer },
      ]);
    } catch (error) {
      console.error("Chatbot query error", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I am having trouble connecting to the brain right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl transition transform hover:scale-105 border-2 border-white"
          aria-label="Open Chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl flex flex-col h-[500px] max-h-[80vh] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-red-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h3 className="text-white font-black italic tracking-widest uppercase text-sm">
                Cylon AI Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    msg.sender === "user"
                      ? "bg-red-600 text-white rounded-tr-none"
                      : "bg-[#222] border border-gray-800 text-gray-200 rounded-tl-none"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                      <ReactMarkdown
                        components={{
                          p: ({ ...props }) => (
                            <p {...props} className="mb-2 last:mb-0" />
                          ),
                          ul: ({ ...props }) => (
                            <ul {...props} className="list-disc pl-4 mb-2" />
                          ),
                          ol: ({ ...props }) => (
                            <ol {...props} className="list-decimal pl-4 mb-2" />
                          ),
                          li: ({ ...props }) => (
                            <li {...props} className="mb-1" />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#222] border border-gray-800 rounded-lg rounded-tl-none p-4 flex items-center gap-2">
                  <div
                    className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-[#1a1a1a] border-t border-gray-800 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-[#222] text-white text-sm px-4 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-red-600 text-white p-2.5 rounded-full hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
