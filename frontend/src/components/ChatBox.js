import React, { useState } from 'react';
import axios from 'axios';
import './ChatBox.css';
import { FiSend } from 'react-icons/fi';

const API_URL = 'https://ai-app-backend-nb02.onrender.com'; // Replace with your Render backend URL

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Something went wrong. Please try again.' },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="message ai">Thinking...</div>}
      </div>
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
  );
}

export default ChatBox;
