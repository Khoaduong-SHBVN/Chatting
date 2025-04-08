// ✅ firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // dùng Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyAuoBkh6ojEhanFX3Ko7MbfqYClRwvjvEtU",
  authDomain: "chatting-08april25.firebaseapp.com",
  projectId: "chatting-08april25",
  storageBucket: "chatting-08april25.appspot.com",
  messagingSenderId: "877320102519",
  appId: "1:877320102519:web:4f0b402116fefd62b5c72",
  measurementId: "G-2GLD29ST47"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);


// ✅ Auth.js
import React, { useState } from "react";
import { auth, database } from "../firebase";
import { ref, set } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

export default function Auth({ onUserAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onUserAuthenticated(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: username,
          photoURL: avatarUrl
        });

        await set(ref(database, `users/${userCredential.user.uid}`), {
          username,
          avatar: avatarUrl
        });

        onUserAuthenticated(userCredential.user);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isLogin ? "Đăng nhập" : "Đăng ký tài khoản"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Tên người dùng"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            /><br />
            <input
              type="text"
              placeholder="Avatar URL (link ảnh)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              required
            /><br />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">{isLogin ? "Đăng nhập" : "Đăng ký"}</button>
      </form>
      <p>
        {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Đăng ký" : "Đăng nhập"}
        </button>
      </p>
    </div>
  );
}


// ✅ CreateRoom.js
import React, { useState } from "react";
import { ref, push } from "firebase/database";
import { database, auth } from "../firebase";

export default function CreateRoom({ onRoomCreated }) {
  const [roomName, setRoomName] = useState("");

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const roomsRef = ref(database, "rooms");
    const newRoomRef = await push(roomsRef, {
      name: roomName,
      createdBy: auth.currentUser.uid,
      createdAt: Date.now()
    });

    onRoomCreated(newRoomRef.key);
    setRoomName("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Tạo phòng chat mới</h3>
      <form onSubmit={handleCreateRoom}>
        <input
          type="text"
          placeholder="Tên phòng"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />
        <button type="submit">+ Tạo phòng</button>
      </form>
    </div>
  );
}


// ✅ ChatRoom.js
import React, { useEffect, useState } from "react";
import { ref, onChildAdded, push } from "firebase/database";
import { auth, database } from "../firebase";

export default function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const messagesRef = ref(database, `messages/${roomId}`);
    onChildAdded(messagesRef, (snapshot) => {
      setMessages((prev) => [...prev, snapshot.val()]);
    });
  }, [roomId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName,
      senderAvatar: auth.currentUser.photoURL,
      createdAt: Date.now()
    };

    const messagesRef = ref(database, `messages/${roomId}`);
    await push(messagesRef, messageData);
    setNewMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Phòng chat</h3>
      <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", marginBottom: 10 }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <img src={msg.senderAvatar} alt="avatar" style={{ width: 30, height: 30, borderRadius: "50%" }} />
            <strong>{msg.senderName}</strong>: {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          required
        />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
}


// ✅ README.md (gợi ý nội dung)
/*
# Firebase Realtime Chat App 🚀

A simple real-time chat app using React + Firebase (Auth + Realtime Database).

## 🔧 Features:
- User Sign Up / Sign In (Email + Password)
- Create a username and upload avatar
- Create and enter custom chat rooms
- Real-time messaging

## 🛠️ Tech Stack:
- React
- Firebase Auth
- Firebase Realtime Database

## 🚀 Getting Started:
```bash
npm install
npm start
```

## ✅ Security:
- Start in test mode for development
- Update security rules before production
*/
