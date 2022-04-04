import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login.js';
import Register from "./components/Register";
import Calendar from './components/Calendar.js';
import Profile from './components/Profile.js';
import Apps from './components/Applications.js';
import Timeline from './components/Timeline.js';
import RecruiterLogin from './components/Recruiter-Login.js';
import RecruiterSearch from './components/Recruiter-Search.js';
import RecruiterApplications from './components/Recruiter-Applications';
import RecruiterTimeline from './components/Recruiter-Timeline';
import Home from "./components/Home";
import { auth, db } from './firebase.js';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Profile />} />
        <Route path="apps" element={<Apps />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="recruiter-login" element={<RecruiterLogin />} />
        <Route path="recruiter-search" element={<RecruiterSearch />} />
        <Route path="recruiter-apps" element={<RecruiterApplications />} />
        <Route path="recruiter-timeline" element={<RecruiterTimeline />} />
        <Route path="/" element={<Navigate replace to="/home" />} />
      </Routes>
    </div>
  );
}

export default App;
