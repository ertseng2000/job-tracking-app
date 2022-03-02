import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login.js';
import Calendar from './components/Calendar.js';
import Profile from './components/Profile.js';
import Apps from './components/Applications.js';
import Timeline from './components/Timeline.js';
import { auth, db } from './firebase.js';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Profile />} />
        <Route path="apps" element={<Apps />} />
        <Route path="apps/timeline" element={<Timeline />} />
        <Route path="login" element={<Login />} />
        <Route path="/" element={<Navigate replace to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
