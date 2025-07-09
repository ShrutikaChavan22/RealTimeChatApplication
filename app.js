import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const App = () => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('typing', ({ user }) => {
      setTypingStatus(`${user} is typing...`);
    });

    socket.on('stopTyping', () => {
      setTypingStatus('');
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, []);

  const joinRoom = () => {
    if (username && room) {
      socket.emit('joinRoom', { username, room });
    }
  };

  const sendMessage = () => {
    if (input) {
      socket.emit('sendMessage', input);
      setInput('');
      socket.emit('stopTyping');
    }
  };

  const handleTyping = () => {
    socket.emit('typing');
    setTimeout(() => {
      socket.emit('stopTyping');
    }, 1000);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Group Chat</h2>
      {!room ? (
        <div>
          <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Room" onChange={(e) => setRoom(e.target.value)} />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <div style={{ border: '1px solid gray', height: '300px', overflowY: 'scroll' }}>
            {messages.map((msg, idx) => (
              <div key={idx}><strong>{msg.user}:</strong> {msg.text}</div>
            ))}
            <p>{typingStatus}</p>
          </div>
          <input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleTyping}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default App;
