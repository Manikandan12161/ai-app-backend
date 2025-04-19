import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatBox.css';
import { FiSend } from 'react-icons/fi';
import { FiCopy, FiCheck } from 'react-icons/fi';


const API_URL = 'https://ai-app-backend-nb02.onrender.com';

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const hasMessages = messages.length > 0;
  const messageEndRef = useRef(null);

  const sendMessage = async () => {
    if (!prompt.trim()) return;

    const newMessage = { sender: 'user', text: prompt };
    setMessages((prev) => [...prev, newMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/ai`, { prompt });
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className={`chat-wrapper ${hasMessages ? 'chat-active' : 'chat-centered'}`}>
      <div className="chat-container">
  {hasMessages && (
    <div className="messages">
     
     {messages.map((msg, i) => (
  <div key={i} className={`message-wrapper ${msg.sender}`}>
    <div className={`message-bubble ${msg.sender}`}>
      {msg.sender === 'ai'
        ? formatMessage(msg.text)
        : <p>{msg.text}</p>}
    </div>

    {msg.sender === 'ai' && (
      <div className="copy-area">
        <button
          className="copy-button"
          onClick={() => {
            navigator.clipboard.writeText(msg.text);
            setCopiedIndex(i);
            setTimeout(() => setCopiedIndex(null), 2000);
          }}
          title="Copy to clipboard"
        >
          {copiedIndex === i ? <FiCheck /> : <FiCopy />}
        </button>
      </div>
    )}
  </div>
))}


      {loading && <div className="message ai">Thinking...</div>}
      <div ref={messageEndRef} />
    </div>
  )}

{messages.length === 0 && (
  <p className="chat-prompt">What Can I Help With ? I Am An AI ChatBot</p>
)}

  {/* 👇 Input box remains the same */}
  <div className="input-box">
    <input
      type="text"
      placeholder="Message to AI..."
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      onKeyPress={handleKeyPress}
    />
    <button onClick={sendMessage}>
      <FiSend />
    </button>
  </div>
</div>
</div>
  );
}
const sanitizeText = (text) =>
  text
    // Fix malformed cases without touching valid **bold**
    .replace(/\*\*(\d+\.\*?)/g, '$1')  // **1.* => 1.*
    .replace(/(\d+\.\*?)\*\*/g, '$1')  // 1.** => 1.
    .replace(/\*\*\s*•/g, '•')         // ** • => •
    .replace(/•\s*\*\*/g, '•')         // • ** => •
    // Preserve valid **bold** phrases
    .replace(/\*+\s+•/g, '•')          // * • => •
    .replace(/^(\*+\s+)/gm, '• ');     // Line starts with * => bullet


const formatMessage = (text) => {
  const cleanedText = sanitizeText(text);
  const preprocessed = cleanedText
    .replace(/\*\s+/g, '\n• ')
    .replace(/\n{3,}/g, '\n\n');

  const sections = preprocessed.split('\n\n');

  return sections.map((section, index) => {
    const trimmed = section.trim();

    if (/^\d+\.\s/.test(trimmed)) {
      const listItems = trimmed
        .split(/\d+\.\s/)
        .filter(item => item.trim())
        .map((item, idx) => <li key={idx}>{highlightBold(item.trim())}</li>);
      return <ul key={index}>{listItems}</ul>;
    }

    if (/^•\s/.test(trimmed)) {
      const listItems = trimmed
        .split(/•\s/)
        .filter(item => item.trim())
        .map((item, idx) => <li key={idx}>{highlightBold(item.trim())}</li>);
      return <ul key={index}>{listItems}</ul>;
    }

    return <p key={index}>{highlightBold(trimmed)}</p>;
  });
};


// Highlight **bold** text using <span class="highlight">
const highlightBold = (text) => {
  const parts = text.split(/(\*\*[^*]+?\*\*)/g); // non-greedy
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className="highlight">
          {part.slice(2, -2).trim()}
        </span>
      );
    }
    return part;
  });
};




export default ChatBox;
