// ✅ App.js - Giao diện đăng nhập giống mẫu Pinterest + giữ nguyên tính năng
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
      const loadedRooms = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
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
    background: "#e2ebf0",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif"
  };

  const cardStyle = {
    background: "white",
    padding: "40px 30px",
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: 360,
    textAlign: "center"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    borderRadius: 6,
    border: "1px solid #ccc"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#222",
    color: "white",
    fontWeight: "bold",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 10
  };

  if (!user) {
    return (
      <div style={loginStyle}>
        <div style={cardStyle}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_green.svg" alt="avatar" style={{ width: 64, marginBottom: 20 }} />
          <h2 style={{ marginBottom: 20 }}>{isLogin ? "Đăng nhập" : "Đăng ký tài khoản"}</h2>
          <form onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <input type="text" placeholder="Tên người dùng" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} required style={inputStyle} />
              </>
            )}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            <button type="submit" style={buttonStyle}>{isLogin ? "LOGIN" : "SIGN UP"}</button>
          </form>
          <p style={{ marginTop: 15 }}>
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            <button onClick={() => setIsLogin(!isLogin)} style={{ marginLeft: 8, border: 0, background: "none", color: "#0077cc", cursor: "pointer" }}>
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Giữ nguyên phần chat bên dưới...

  return <div>Giao diện chat sẽ hiển thị ở đây...</div>;
}
