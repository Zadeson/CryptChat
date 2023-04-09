import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from './App.module.css'; // Import the CSS file
import { FaUserPlus, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io('http://localhost:5000');

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('');

  const formatTimestamp = (date) => {
    const today = new Date();
    const yesterday = subtractDays(today, 1);
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const hours12 = ((date.getHours() + 11) % 12) + 1;
    const amPm = date.getHours() >= 12 ? "PM" : "AM";
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
  
    if (isToday) {
      return `Today at ${hours12}:${minutes} ${amPm}`;
    } else if (isYesterday) {
      return `Yesterday at ${hours12}:${minutes} ${amPm}`;
    } else {
      return `${month}/${day}/${year} ${hours12}:${minutes} ${amPm}`;
    }
  };
  

  const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };
  
  

  const login = () => {
    // Add your authentication logic here
    setLoggedIn(true);

    socket.on("message", (data) => {
      const timestamp = formatTimestamp(new Date());
      setMessages((oldMessages) => [
        ...oldMessages,
        {
          username: data.username,
          message: data.msg,
          timestamp: timestamp,
          isServerMessage: data.isServerMessage,
        },
      ]);
    });
  };

  
  const logout = () => {
    setLoggedIn(false);
    socket.off("message");
  };


  const joinRoom = () => {
    if (room !== "") {
      if (currentRoom !== "") {
        socket.emit("leave_room", { username, room: currentRoom });
      }
      setMessages([]);
      setCurrentRoom(room);
      socket.emit("join_room", { username, room });
    }
  };
  

  const joinRoomFromList = (roomToJoin) => {
    setMessages([]);
    setCurrentRoom(roomToJoin);
    socket.emit("join_room", { username, room: roomToJoin });
  };
  
  
  
  const sendMessage = () => {
    if (message !== '') {
      socket.emit('send_message', { room, username, msg: message });
      setMessage('');
    }
  };
  useEffect(() => {

    return () => {
      socket.off("message");
    };
  }, []);

  return (
    <>
            {
        !loggedIn ? (
          <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
              <h2 className={styles.loginHeader}>LOGIN</h2>
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
              <div className={styles.loginButtonWrapper}>
                <button
                  className={`btn ${
                    !username || !password
                      ? styles.btnDisabled
                      : styles.loginButton
                  }`}
                  onClick={login}
                  disabled={!username || !password}
                  style={
                    !username || !password
                      ? { borderColor: "#575a66", color: "#ffffff" }
                      : { borderColor: "#868895", color: "#ffffff" }
                  }
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
            <button
              className={`btn ${room === "" ? styles.btnDisabled : styles.btnActive}`}
              onClick={joinRoom}
              disabled={room === ""}
              style={
                room === ""
                  ? { borderColor: "#575a66", color: "#ffffff" }
                  : { borderColor: "#868895", color: "#ffffff" }
              }
            >
              <FaUserPlus /> Join Room
            </button>

          </div>
          <div className={styles.chat}>
            <div className={styles.chatHeader}>
              <h3>{currentRoom ? currentRoom : 'No Room Selected'}</h3>
            </div>
            <div className={styles.chatBox}>
            {
              messages
                .reduce((acc, msg, idx, src) => {
                  if (
                    idx === 0 ||
                    (src[idx - 1] && src[idx - 1].username !== msg.username)
                  ) {
                    acc.push({ user: msg.username, timestamp: msg.timestamp, messages: [msg] });
                  } else {
                    acc[acc.length - 1].messages.push(msg);
                  }
                  return acc;
                }, [])
                .map((group, index) => (
                  <div key={index}>
                    <div className={styles.messageContainer}>
                      <strong>{'<' + group.user + '>'}</strong>
                      <span className={styles.timestamp}> {group.timestamp}</span>
                      <br />
                      {group.messages.map((message, idx) => (
                        <div key={idx}>
                          <span>{message.message}</span>
                          <br />
                        </div>
                      ))}
                    </div>
                    {index !== messages.length - 1 && (
                      <div className={styles.divider}></div>
                    )}
                  </div>
                ))
            }






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
                className={`btn ${message === '' ? styles.btnDisabled : styles.btnActive}`}
                type="button"
                onClick={sendMessage}
                disabled={message === ''}
                style={
                  message === ''
                    ? { borderColor: "#575a66", color: "#ffffff" }
                    : { borderColor: "#868895", color: "#ffffff" }
                }
              >
                Send
              </button>



              </div>
            </div>
          </div>
          <button
            className={`btn ${styles.btn}`}
            style={{
              position: "absolute",
              bottom: "1rem",
              left: "1rem",
              borderColor: "#575a66",
              color: "#ffffff",
            }}
            onClick={logout}
          >
            <FaSignOutAlt /> Log Out
          </button>



        </div>
      )}
    </>
  );
}

export default App;