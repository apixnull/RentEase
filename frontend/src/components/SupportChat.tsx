import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportChat = ({ isOpen, onClose }: SupportChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "👋 Hello! I'm your AI assistant powered by advanced AI technology. I'm here to help you with any questions about RentEase, property management, leases, payments, or anything else you need assistance with. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const queryAI = async (question: string) => {
    try {
      const response = await fetch(
        "https://cloud.flowiseai.com/api/v1/prediction/600282e7-3991-47a1-a612-d5a05393437a",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error querying AI:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await queryAI(userMessage.text);
      
      // Extract the answer from Flowise AI response
      // Flowise typically returns: { text: "answer" } or similar structure
      let aiText = "";
      if (typeof response === 'string') {
        aiText = response;
      } else if (response?.text) {
        aiText = response.text;
      } else if (response?.answer) {
        aiText = response.answer;
      } else if (response?.response) {
        aiText = response.response;
      } else if (response?.message) {
        aiText = response.message;
      } else {
        // Fallback: try to find any string value in the response
        const stringValue = Object.values(response).find(
          (val) => typeof val === 'string' && val.length > 0
        );
        aiText = stringValue as string || "I received your message, but couldn't process it properly.";
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/10"
        onClick={onClose}
      />

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <div
            ref={chatRef}
            className={cn(
              "fixed top-20 right-4 z-[9999] w-[90vw] sm:w-80 h-[500px] max-h-[calc(100vh-6rem)]",
              "bg-white rounded-lg shadow-2xl border border-gray-200/60",
              "flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-blue-600 text-white p-3 flex items-center justify-between flex-shrink-0 relative overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full blur-xl animate-pulse delay-300"></div>
              </div>
              
              <div className="flex items-center gap-2 relative z-10">
                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30 shadow-lg">
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                    <span>AI Assistant</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full border border-white/30">
                      AI
                    </span>
                  </h3>
                  <p className="text-[10px] text-white/80 mt-0.5">Powered by AI</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 text-white hover:bg-white/20 flex-shrink-0 relative z-10"
                aria-label="Close chat"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 bg-gray-50/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!message.isUser && (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center flex-shrink-0 border border-green-200 shadow-sm">
                      <Sparkles className="h-3 w-3 text-green-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2 text-xs shadow-sm",
                      message.isUser
                        ? "bg-gradient-to-r from-green-600 to-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900 relative"
                    )}
                  >
                    {!message.isUser && (
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                  {message.isUser && (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center flex-shrink-0 border border-green-200 shadow-sm">
                      <span className="text-[10px] font-semibold text-green-700">
                        You
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center flex-shrink-0 border border-green-200 shadow-sm">
                    <Sparkles className="h-3 w-3 text-green-600 animate-pulse" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-green-600" />
                    <span className="text-[10px] text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/50 flex-shrink-0">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask AI anything..."
                    disabled={isLoading}
                    className="flex-1 h-9 text-xs pl-8 bg-white border-gray-200 focus:border-green-500"
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white h-9 w-9 p-0 shadow-md hover:shadow-lg transition-all"
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                💡 AI-powered assistance • Ask me anything about RentEase
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChat;

