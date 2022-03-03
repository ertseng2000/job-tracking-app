// Displays timeline for application

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, setDoc, addDoc , getDocs, deleteDoc, orderBy} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Timeline.css';
import { useSearchParams } from "react-router-dom";
import Popup from 'reactjs-popup';


export default function Timeline() {
  
  useEffect(() => {
    checkIfSignedIn();
  }, []);
  const user = auth.currentUser;
  
  
  
  
  const companyName = localStorage.getItem('currCompany');
  const applicationId = localStorage.getItem('currCompanyId');
  console.log(applicationId)

  const [name, setName] = useState('');
  const [pageReady, setReady] = useState(false);
  const [events, setEvents] = useState([{
    tag: '',
    date: ''
  }]);
  const [tag, setTag] = useState('Applied');
  const [date, setDate] = useState('');


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
    const dataQuery = query(collection(db, appPath), where("appId", "==", applicationId));
    const unsubscribe = onSnapshot(dataQuery, (querySnapshot) => {
      
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

  // Moves to calendar page
  const calendar = () => window.location.href = "/calendar";

  // Navigates user to profile page
  const profile = () => window.location.href = "/profile";

  //Deletes current application and redirects to application page
  const deleteApp = async() => {
    //First delete all updates corresponding to the current app
    const updatesPath = 'updates/' + auth.currentUser.uid + '/appUpdates';
    const q = query(collection(db, updatesPath), where("appId", "==", applicationId));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      doc.ref.delete();
      console.log(`deleted: ${doc.id}`);
    });

    
    //Then delete currect application
    const appPath = 'users/' + auth.currentUser.uid + '/applications';
    await deleteDoc(doc(db, appPath, applicationId));


    window.location.href = "/apps";
  };

  const submitEvent = async () => {
    console.log(tag);
    const asDate = new Date(date);
    console.log(asDate);
    
    const updatesPath = 'updates/' + auth.currentUser.uid + '/appUpdates';
    await setDoc(doc(collection(db, updatesPath)), {
      tag: tag,
      date: asDate,
      appId: applicationId,
      companyName: companyName
    });
    
  };

  // Renders page after loading
  if (pageReady) {
    events.sort((a,b)=>b.date - a.date);
    console.log(events);
    console.log(companyName);
    
    return (
      <>
        <h1>{companyName} Application Timeline</h1>
        <nav>
          <button onClick={profile}>Profile</button>
          <button onClick={logout}>Logout</button>
          <button onClick={apps}>Application List</button>
          <button onClick={calendar}>Calendar</button>
        </nav>
        <button onClick={deleteApp}>Delete This Application</button>
        <Popup trigger={<button>Add New Event</button>} position="right center">
          <div>Fill in this form!</div>
          <label for="tags">Select an Event Type:</label>
          <select id="tags" name="tags" onChange={(e) => {setTag(e.target.value)}} >
            <option value="Applied">Applied</option>
            <option value="Take Home Assessment">Take Home Assessment</option>
            <option value="Phone Screen">Phone Screen</option>
            <option value="Interview">Interview</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="Final Round Interview">Final Round Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            
            
          </select>
          <input type='date' onChange={(e) => {setDate(e.target.value)}} />
          

          <button id='submitButton' onClick={submitEvent}>Submit</button>
        </Popup>
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
