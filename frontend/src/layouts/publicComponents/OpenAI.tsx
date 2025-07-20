import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = import.meta.env.VITE_CHAT_API_KEY;

export default function DeepseekChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "RentEase Chat",
        },

        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            { role: "system", content: "You are a helpful assistant for RentEase." },
            ...updatedMessages,
          ],
        }),
      });

      const data = await response.json();
      const botMessage = data?.choices?.[0]?.message;

      if (botMessage?.content) {
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute bottom-6 right-6 w-[360px] h-[500px] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-300 dark:border-zinc-700 flex flex-col overflow-hidden pointer-events-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  RentEase Chat
                </h2>
                <button onClick={toggleChat} className="text-zinc-500 hover:text-red-500 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-xs px-4 py-2 rounded-lg whitespace-pre-line ${
                      msg.role === "user"
                        ? "ml-auto bg-blue-500 text-white"
                        : "mr-auto bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="mr-auto bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-lg animate-pulse">
                    Typing...
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                <textarea
                  rows={2}
                  className="w-full resize-none p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ask something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading}
                  className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-30 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </>
  );
}
