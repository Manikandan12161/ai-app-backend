import React from 'react';
import ChatBox from './components/ChatBox';
import './App.css';
import logo from './logo.jpg';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} alt="Logo" className="app-logo" />
        <h1>AI Chat</h1>
      </header>
      <ChatBox />
    </div>
  );
}

export default App;
