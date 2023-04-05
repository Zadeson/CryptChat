import React, { useState } from 'react';
import io from 'socket.io-client';
import styles from './App.module.css'; // Import the CSS file
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io('http://localhost:5000');

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const login = () => {
    // Add your authentication logic here
    setLoggedIn(true);
  };

  const joinRoom = () => {
    if (room !== '') {
      socket.emit('join_room', { username, room });

      socket.on('message', (data) => {
        setMessages((oldMessages) => [...oldMessages, data.msg]);
      });
    }
  };

  const sendMessage = () => {
    if (message !== '') {
      socket.emit('send_message', { room, username, msg: message });
      setMessage('');
    }
  };

  return (
    <>
      {!loggedIn ? (
        <div className={styles.loginContainer}>
          <div className={styles.dark}>
            <div className="form-group">
              <input
                type="text"
                className={`form-control ${styles.formControl}`}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className={`form-control ${styles.formControl}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
            <button
              className={`btn ${styles.btn}`}
              onClick={login}
              disabled={!username || !password}
            >
              Login
            </button>
          </div>

          </div>
        </div>
      ) : (
        <div className={styles.dark}>
          <div className={styles.sidebar}>
            <div className="form-group">
              <input
                type="text"
                className={`form-control ${styles.formControl}`}
                placeholder="Room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
            <button className={`btn ${styles.btn}`} onClick={joinRoom}>
              Join Room
            </button>
            <div className="list-group mt-3">
              {/* Your list of chat rooms */}
            </div>

          </div>
          <div className={styles.chat}>
            <div className={styles.chatBox}>
              {messages.map((message, index) => (
                <div key={index}>
                  <strong>{message.username}</strong>: {message.message}
                </div>
              ))}
            </div>
            <div className="input-group">
              <input
                type="text"
                className={`form-control ${styles.formControl}`}
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="input-group-append">
                <button
                  className={`btn ${styles.btn}`}
                  type="button"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;