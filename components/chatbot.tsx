'use client'

import { useState, useRef, useEffect } from 'react'

// A simple chat bubble icon SVG
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null as unknown);
        const errorMessage =
          typeof (errorPayload as any)?.error === 'string'
            ? (errorPayload as any).error
            : 'Failed to get response from the server.';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const botMessage: Message = { text: data.answer, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);
      const text =
        error instanceof Error && error.message
          ? error.message
          : 'Sorry, something went wrong. Please try again.';
      const errorMessage: Message = { text, sender: 'bot' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-primary-blue text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">AI Assistant</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              &times;
            </button>
          </div>
          {/* Message Display Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-light-gray-100">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-secondary-blue text-white' : 'bg-gray-200 text-dark-gray-900'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="p-3 rounded-lg bg-gray-200 text-gray-900">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 text-dark-gray-900 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-blue"
              />
              <button onClick={handleSendMessage} disabled={isLoading} className="px-4 py-2 font-semibold text-white bg-primary-orange rounded-full hover:opacity-90 disabled:bg-primary-orange/50">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 bg-primary-orange text-white p-4 rounded-full shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange z-50"
        aria-label="Open chat"
      >
        <ChatIcon />
      </button>
    </div>
  )
}
