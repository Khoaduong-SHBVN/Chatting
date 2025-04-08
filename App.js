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


// ✅ App.js
import React, { useState } from "react";
import Auth from "./components/Auth";
import CreateRoom from "./components/CreateRoom";
import ChatRoom from "./components/ChatRoom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";

export default function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
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

  if (!user) return <Auth onUserAuthenticated={setUser} />;

  if (roomId) return <ChatRoom roomId={roomId} />;

  return (
    <div style={{ padding: 20 }}>
      <h2>Xin chào, {user.displayName}</h2>
      <img src={user.photoURL} alt="avatar" style={{ width: 50, height: 50, borderRadius: "50%" }} /><br />
      <button onClick={() => signOut(auth)}>Đăng xuất</button>

      <hr />
      <CreateRoom onRoomCreated={setRoomId} />

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
