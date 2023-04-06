import React, { useState } from 'react';
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
  const [joinedRooms, setJoinedRooms] = useState([]);


  const login = () => {
    // Add your authentication logic here
    setLoggedIn(true);
  };


  const joinRoom = () => {
    if (room !== "") {
      setMessages([]);
      setCurrentRoom(room);
      socket.emit("join_room", { username, room });

      if (!joinedRooms.includes(room)) {
        setJoinedRooms([...joinedRooms, room]);
      }
  
      socket.on("message", (data) => {
        setMessages((oldMessages) => [
          ...oldMessages,
          {
            username: data.username,
            message: data.msg,
            timestamp: new Date().toLocaleTimeString(),
            isServerMessage: data.isServerMessage,
          },
        ]);
      });
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
            <div className={styles.roomsList}>
              <h4>Joined Rooms:</h4>
              <ul>
                {joinedRooms.map((joinedRoom, index) => (
                  <li key={index} onClick={() => joinRoomFromList(joinedRoom)}>
                    {joinedRoom}
                  </li>
                ))}
              </ul>
            </div>

          </div>
          <div className={styles.chat}>
            <div className={styles.chatHeader}>
              <h3>{currentRoom ? currentRoom : 'No Room Selected'}</h3>
            </div>
            <div className={styles.chatBox}>
            {messages.map((message, index) => (
              <div key={index} className={styles.messageContainer}>
                <div>
                  <span className={styles.timestamp}>{message.timestamp}</span>
                  <br />
                  {message.isServerMessage ? (
                    <span>
                      {message.username} has joined the room.
                    </span>
                  ) : (
                    <>
                      <strong>{'<' + message.username + '>'}</strong>
                      <span> : </span>
                      <span>{message.message}</span>
                    </>
                  )}
                </div>
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
              color: "#ffffff"
            }}
            onClick={() => setLoggedIn(false)}
          >
            <FaSignOutAlt /> Log Out
          </button>



        </div>
      )}
    </>
  );
}

export default App;