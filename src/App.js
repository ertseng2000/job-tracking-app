import './App.css';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

import Login from './components/Login.js';
import Calendar from './components/Calendar.js';
import Profile from './components/Profile.js';
import { auth, db } from './firebase.js';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Profile />} />
        <Route path="login" element={<Login />} />
        <Route path="/" element={<Navigate replace to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
