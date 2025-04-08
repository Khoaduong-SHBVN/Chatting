// ✅ App.js - Full code chuẩn với giao diện đẹp và firebase mới hoạt động
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

const firebaseConfig = {
  apiKey: "AIzaSyCdniZSVpJm7F6d0YVoboV-PmLLGbPSbC4",
  authDomain: "chatbox-2-7d4ce.firebaseapp.com",
  projectId: "chatbox-2-7d4ce",
  storageBucket: "chatbox-2-7d4ce.appspot.com",
  messagingSenderId: "997567171125",
  appId: "1:997567171125:web:29f89d2d3c1423eb19302c",
  measurementId: "G-KTBTRWTYLY"
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

  const loginStyle = {
    background: "linear-gradient(to right, #a8e063, #56ab2f)",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.9)",
    padding: 30,
    borderRadius: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    width: 320,
    textAlign: "center"
  };

  if (!user) {
    return (
      <div style={loginStyle}>
        <div style={cardStyle}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_green.svg" alt="avatar" style={{ width: 80, marginBottom: 20 }} />
          <h2 style={{ marginBottom: 20 }}>{isLogin ? "Đăng nhập" : "Đăng ký tài khoản"}</h2>
          <form onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Tên người dùng"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ marginBottom: 10, width: "100%", padding: 10 }}
                />
                <input
                  type="text"
                  placeholder="Avatar URL (link ảnh)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  required
                  style={{ marginBottom: 10, width: "100%", padding: 10 }}
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginBottom: 10, width: "100%", padding: 10 }}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ marginBottom: 10, width: "100%", padding: 10 }}
            />
            <button type="submit" style={{ background: "#333", color: "white", width: "100%", padding: 10, border: 0, cursor: "pointer" }}>
              {isLogin ? "LOGIN" : "SIGN UP"}
            </button>
          </form>
          <p style={{ marginTop: 10 }}>
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            <button onClick={() => setIsLogin(!isLogin)} style={{ marginLeft: 10, border: "none", background: "transparent", color: "#333", cursor: "pointer" }}>
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </button>
          </p>
        </div>
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
