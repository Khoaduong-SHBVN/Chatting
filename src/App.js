// ✅ App.js - Đã sửa dấu gạch ngang đúng trong authDomain
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  onChildAdded
} from "firebase/database";

// Firebase config
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
const auth = getAuth(app);
const database = getDatabase(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const roomsRef = ref(database, "rooms");
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loadedRooms = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value
      }));
      setRooms(loadedRooms);
    });
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const messagesRef = ref(database, `messages/${roomId}`);
    setMessages([]);
    onChildAdded(messagesRef, (snapshot) => {
      setMessages((prev) => [...prev, snapshot.val()]);
    });
  }, [roomId]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
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
        setUser(userCredential.user);
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    const roomsRef = ref(database, "rooms");
    const newRoomRef = await push(roomsRef, {
      name: roomName,
      createdBy: auth.currentUser.uid,
      createdAt: Date.now()
    });
    setRoomId(newRoomRef.key);
    setRoomName("");
  };

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

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>{isLogin ? "Đăng nhập" : "Đăng ký tài khoản"}</h2>
        <form onSubmit={handleAuth}>
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

  if (roomId) {
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
        <br />
        <button onClick={() => setRoomId(null)}>⬅ Quay lại danh sách phòng</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Xin chào, {user.displayName}</h2>
      <img src={user.photoURL} alt="avatar" style={{ width: 50, height: 50, borderRadius: "50%" }} /><br />
      <button onClick={() => signOut(auth)}>Đăng xuất</button>

      <hr />
      <h3>Tạo phòng mới</h3>
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

      <h3>Danh sách phòng</h3>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <button onClick={() => setRoomId(room.id)}>{room.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
