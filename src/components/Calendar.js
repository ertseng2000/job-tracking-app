// Calendar view page, utilizing Fullcalendar library
// https://fullcalendar.io/

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, setDoc, addDoc } from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { auth, db } from '../firebase.js';
import './Calendar.css';

export default function Calendar() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);

  // Initializing states + variables
  let dataArray = [];
  const [name, setName] = useState('');
  const [pageReady, setReady] = useState(false);
  const [events, setEvents] = useState([{
    title: '',
    start: '',
    allDay: true
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

  // Firestore snapshot listener
  const getFirestoreData = (currentUser) => {
    const appPath = 'updates/' + currentUser.uid + '/appUpdates';
    const dataQuery = query(collection(db, appPath));
    const unsubscribe = onSnapshot(dataQuery, (querySnapshot) => {
      setEvents(querySnapshot.docs.map(doc => ({
        title: doc.data().companyName + ': ' + doc.data().tag,
        start: doc.data().date.toDate(),
        allDay: true
      })));
    });
  }

  // Create event
  // TODO: maybe import a nicer looking prompt?
  const createEvent = (date) => {
    const test = prompt('Does nothing for now');
  }

  // Logs out user from site
  const logout = () => { signOut(auth).then(() => {}).catch(error => console.log("Error: " + error.message)) }

  // Moves to app list page
  const apps = () => window.location.href = "/apps";

  // Navigates user to profile page
  const profile = () => window.location.href = "/profile";

  // Renders page after loading
  if (pageReady) {
    return (
      <>
        <h1>Calendar Page</h1>
        <p>Welcome {name}!</p>
        <p>Click on a date to add an event</p>
        <nav>
          <button onClick={profile}>Profile</button>
          <button onClick={logout}>Logout</button>
          <button onClick={apps}>Application List</button>
        </nav>
        <br />
        <div id='calendar'>
          <FullCalendar
            plugins = {[dayGridPlugin, interactionPlugin]}
            initialView = "dayGridMonth"
            events={events}
            dateClick={(e) => createEvent(e.date)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <p id='loadingPage'>Loading...</p>
    </>
  );
}
