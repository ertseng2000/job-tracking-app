// Displays timeline for application

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, setDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Timeline.css';
import { useSearchParams } from "react-router-dom";

export default function Timeline() {
  
  useEffect(() => {
    checkIfSignedIn();
  }, []);
  const user = auth.currentUser;
  
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  const companyName = localStorage.getItem('currCompany');
  const applicationId = localStorage.getItem('currCompanyId');
  console.log(applicationId)

  const [name, setName] = useState('');
  const [pageReady, setReady] = useState(false);
  const [events, setEvents] = useState([{
    tag: '',
    date: ''
  }]);


  // Firebase auth observer. Sends user back to login page if not signed in
  const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName);
        getFirestoreData(auth.currentUser);
        setReady(true);
      } else {
        window.location.href="/login"
      }
    });
  };

  const getFirestoreData = (currentUser) => {
    const appPath = 'updates/' + currentUser.uid + '/appUpdates';
    const dataQuery = query(collection(db, appPath), where("companyName", "==", companyName));
    const unsubscribe = onSnapshot(dataQuery, (querySnapshot) => {
      console.log(querySnapshot.docs)
      setEvents(querySnapshot.docs.map(doc => ({
        tag: doc.data().tag,
        date: doc.data().date.toDate()
      })));
    });
  }

  // Logs out user from site
  const logout = () => { signOut(auth).then(() => {}).catch(error => console.log("Error: " + error.message)) }

  // Moves to app list page
  const apps = () => window.location.href = "/apps";

  // Navigates user to profile page
  const profile = () => window.location.href = "/profile";
  // Renders page after loading
  if (pageReady) {
    console.log(events);
    console.log(companyName);
    
    return (
      <>
        <h1>{companyName} Application Timeline</h1>
        <nav>
          <button onClick={profile}>Profile</button>
          <button onClick={logout}>Logout</button>
          <button onClick={apps}>Application List</button>
        </nav>
        <br />

        {events.map((event) =>
            <div className = "timeLineSection"> 
            <h1>{event.tag}</h1>
            <p>{event.date.toString()}</p>
            </div>
          )}
      </>
    );
  }

  return (
    <>
      <p id='loadingPage'>Loading...</p>
    </>
  );
}
