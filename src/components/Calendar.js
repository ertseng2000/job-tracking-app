// Calendar view page, utilizing Fullcalendar library
// https://fullcalendar.io/

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { auth, db } from '../firebase.js';
import './Calendar.css';
import NavBarJTR from './Navbar.js';

export default function Calendar() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);

  //Color coding map:
  const statusColors = new Map([
    ['Applied', 'grey'],
    ['Take Home Assessment', 'orange'],
    ['Phone Screen', 'green'],
    ['Interview', 'blue'],
    ['Technical Interview', 'DarkGreen'],
    ['Final Round Interview', 'purple'],
    ['Offer', 'DarkGoldenRod'],
    ['Rejected', 'red']

  ])
  // Initializing states + variables
  let dataArray = [];
  const [name, setName] = useState('');
  const [pageReady, setReady] = useState(false);
  const [events, setEvents] = useState([{
    title: '',
    start: '',
    allDay: true,
    extendedProps: {
      appId: '',
      companyName: ''
    }

  }]);


  // Firebase auth observer. Sends user back to login page if not signed in
  const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        setName(user.displayName);
        getFirestoreData(auth.currentUser);
        setReady(true);
      } else {
        window.location.href="/home";
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
        allDay: true,
        extendedProps: {
          appId: doc.data().appId,
          companyName: doc.data().companyName
        },
        backgroundColor: statusColors.get(doc.data().tag)
        
      })));
    });
  }

  // Create event
  // TODO: maybe import a nicer looking prompt?
  const createEvent = (date) => {
    //const test = prompt('Maybe add events? Does nothing for now');
  }

  // TODO: edit event?
  const editEvent = () => {
    //const test = alert('Suggestion: Takes user to app page to edit');
  }

  const goToTimeLine = (e) => {
    console.log(e)
    localStorage.setItem('currCompany', e.event.extendedProps.companyName);
    localStorage.setItem('currCompanyId', e.event.extendedProps.appId);
    localStorage.setItem('event', e);
   
    window.location.href = "/timeline";
  };

  // Renders page after loading
  if (pageReady) {
    console.log(events);
    return (
      <>
        <NavBarJTR></NavBarJTR>
        <br />
        <div id='calendar'>
          <FullCalendar
            plugins = {[dayGridPlugin, interactionPlugin]}
            initialView = "dayGridMonth"
            events={events}
            dateClick={(e) => createEvent(e.date)}
            eventClick={ (e) =>goToTimeLine(e)}

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
