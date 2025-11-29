/**
 * =============================================================================
 * CHAT WIDGET COMPONENT
 * =============================================================================
 * A beautiful floating chat widget for AI assistant interactions.
 * Works for both employees and admins.
 * 
 * Features:
 * - Floating button that expands to chat window
 * - Message history with user/AI distinction
 * - Typing indicator
 * - Auto-scroll to latest message
 * - Responsive design
 * 
 * TODO: Connect to n8n webhook for actual AI responses
 * =============================================================================
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { sendChatMessage } from "../../services/n8nClient";
import "./ChatWidget.css";

/**
 * Message interface for chat history
 */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * ChatWidget - Floating AI chat assistant
 */
export function ChatWidget(): JSX.Element {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! 👋 I'm your Lighthouse AI assistant. I can help you with ${
        role === "admin" 
          ? "expense reviews, policy questions, and analytics insights" 
          : "expense submissions, policy questions, and tracking your reimbursements"
      }. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  /**
   * Handle sending a message
   */
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call n8n chat endpoint (currently a stub)
      const response = await sendChatMessage(userMessage.content, role || "employee");

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-widget">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <span>🤖</span>
              </div>
              <div className="chat-header-text">
                <h3 className="chat-title">Lighthouse AI</h3>
                <span className="chat-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <button 
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message--${message.role}`}
              >
                {message.role === "assistant" && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    {message.content}
                  </div>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-message chat-message--assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" />
              </svg>
            </button>
          </div>

          {/* Powered By */}
          <div className="chat-footer">
            <span>Powered by Lighthouse AI • Guardrails Enabled 🛡️</span>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`chat-fab ${isOpen ? "chat-fab--hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <span className="chat-fab-icon">💬</span>
        <span className="chat-fab-pulse"></span>
      </button>
    </div>
  );
}

export default ChatWidget;
