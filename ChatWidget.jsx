import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m Klem. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const panelRef = useRef(null);

  const toggleOpen = () => setIsOpen((o) => !o);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-10) }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, there was an error.' }]);
      console.error(err);
    }
  };

  // auto scroll to bottom when messages update
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  return (
    <>
      <button className="chat-toggle" onClick={toggleOpen}>
        💬
      </button>

      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            Klem Assistant
            <button onClick={toggleOpen}>✕</button>
          </div>
          <div className="chat-messages" ref={panelRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.role}`}>{msg.content}</div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
