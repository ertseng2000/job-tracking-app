import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import './Calendar.css';

export default function Calendar() {

  const user = auth.currentUser;
  const [name, setName] = useState('');

  // TODO abstract this function out to a common js file
  // Firebase auth observer. Sends user back to login page if not signed in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      setName(user.displayName);
    } else {
      window.location.href = "/login";
    }
  });

  // Logs out user from site
  const logout = () => { signOut(auth).then(() => {}).catch(error => console.log("Error: " + error.message)) }

  // Navigates user to profile page
  const profile = () => {
    window.location.href = "/profile";
  }

  return (
    <>
      <h1>Calendar Page</h1>
      <p>Welcome {name}!</p>
      <nav>
        <button onClick={profile}>Profile</button>
        <button onClick={logout}>Logout</button>
      </nav>
    </>
  );
}
