// Displays timeline for application

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, setDoc, updateDoc , getDocs, deleteDoc, getDoc} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Recruiter-Timeline.css';
import { useSearchParams } from "react-router-dom";
import Popup from 'reactjs-popup';
import RecruiterNavBarJTR from './Recruiter-NavBar.js';

export default function RecruiterTimeline() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);
  const user = auth.currentUser;

  const companyName = localStorage.getItem('currCompany');
  const applicationId = localStorage.getItem('applicationId');
  const applicantName = localStorage.getItem('applicantName');
  const applicantId = localStorage.getItem('applicantId');
  console.log(applicantId)
  console.log(applicationId)
  const applicantEmail = localStorage.getItem('applicantEmail');

  console.log(localStorage.getItem('event'));
  console.log(applicationId)
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
  const [name, setName] = useState('');
  const [pageReady, setReady] = useState(false);
  const [events, setEvents] = useState([{
    tag: '',
    date: new Date(),
    id: ''
  }]);
  const [tag, setTag] = useState('Applied');
  const [date, setDate] = useState('');

  const [editTag, setEditTag] = useState('Applied');
  const [editDate, setEditDate] = useState('');


  // Firebase auth observer. Sends user back to login page if not signed in
  const checkIfSignedIn = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        checkIfRecruiter(user);
        setName(user.displayName);
        getFirestoreData(auth.currentUser);
        setReady(true);
      } else {
        window.location.href="/login";
      }
    });
  };

  const checkIfRecruiter = async (currUser) => {
    const docRef = doc(db, "users", currUser.uid)
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (docSnap.data().isRecruiter === null || docSnap.data().isRecruiter === undefined) {
        window.location.href="/recruiter-login";
      }
    } else {
      console.log("Error reading isRecruiter flag");
      }
  }

  const getFirestoreData = (currentUser) => {
    const appPath = 'updates/' + applicantId + '/appUpdates';
    const dataQuery = query(collection(db, appPath), where("appId", "==", applicationId));
    const unsubscribe = onSnapshot(dataQuery, (querySnapshot) => {

      setEvents(querySnapshot.docs.map(doc => ({
        tag: doc.data().tag,
        date: new Date(doc.data().date.toDate()),
        id: doc.id
      })));
    });
  }

  //Deletes current application and redirects to application page
  const deleteApp = async() => {
    if(window.confirm("Are you sure you want to delete this application?")== true){
      //First delete all updates corresponding to the current app
      const updatesPath = 'updates/' + applicantId + '/appUpdates';
      const q = query(collection(db, updatesPath), where("appId", "==", applicationId));

      const querySnapshot = await getDocs(q);
      console.log(querySnapshot)
      for (const docu of querySnapshot.docs) {

        await deleteDoc(doc(db, updatesPath, docu.id));
        console.log(`deleted: ${docu.id}`);
      }

      /*
      querySnapshot.forEach((doc) => {
        console.log(doc.ref);
        doc.ref.delete();
        console.log(`deleted: ${doc.id}`);
      });*/


      //Then delete currect application
      const appPath = 'users/' + applicantId + '/applications';
      await deleteDoc(doc(db, appPath, applicationId));


      window.location.href = "/recruiter-apps";
    }

  };

  const submitEvent = async () => {
    console.log(tag);
    const asDate = new Date(date);

    //fix off-by-one error when converting from jsx to js date
    asDate.setDate(asDate.getDate() + 1);

    console.log(asDate);

    const updatesPath = 'updates/' + applicantId + '/appUpdates';
    await setDoc(doc(collection(db, updatesPath)), {
      tag: tag,
      date: asDate,
      appId: applicationId,
      companyName: companyName
    });
    await updateStatus();

  };

  const submitEditEvent = async (id) => {
    console.log(editTag);
    const asDate = new Date(editDate);
    asDate.setDate(asDate.getDate() + 1);
    console.log(asDate);

    const updatesPath = 'updates/' + applicantId + '/appUpdates';
    await setDoc(doc(collection(db, updatesPath), id), {
      tag: editTag,
      date: asDate,
      appId: applicationId,
      companyName: companyName
    });
    await updateStatus();

  };

  //Deletes current application and redirects to application page
  const deleteEvent = async(id) => {
    //First delete all updates corresponding to the current app
    const updatesPath = 'updates/' + applicantId + '/appUpdates';
    await deleteDoc(doc(db, updatesPath, id));
    await updateStatus();
  };
  const updateStatus = async() => {
    const newStatus = await getStatus();
    const appPath = 'users/' + applicantId + '/applications';
    const appRef = doc(db, appPath, applicationId);
    await updateDoc(appRef, {
      currentStatus: newStatus
    });
  }
  //TODO: optimize this function
  const getStatus = async () => {
    const updatesPath = 'updates/' + applicantId + '/appUpdates';
    const q = query(collection(db, updatesPath), where("appId", "==", applicationId));

    const querySnapshot = await getDocs(q);
    var docs = querySnapshot.docs;

    if(docs.length == 0){
      return "This application has no statuses";
    }
    docs.sort((a,b)=> new Date(b.data().date.toDate())- new Date(a.data().date.toDate()));
    console.log(docs);
    const tag = docs[0].data().tag;
    const date = new Date(docs[0].data().date.toDate());
    return tag + ' ' + date.toDateString();

  };
  // Renders page after loading
  if (pageReady) {
    events.sort((a,b)=>b.date - a.date);
    console.log(events);
    console.log(companyName);

    return (
      <>
        <RecruiterNavBarJTR></RecruiterNavBarJTR>
        <h1 id = "timeline-head">{applicantName}'s Timeline</h1>

        <Popup trigger={<button id = "add-update-button">New Update</button>} position="right center">
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
        <button id = "delete-app-button" onClick={deleteApp}>Delete This Application</button>
        <br />

        {events.map((event) =>
            <div className = "timeline-section">
            <h5 className='timeline-tag' >{event.tag}</h5>
            <p>{event.date.toDateString()}</p>

            {/* Pop up form for edit event */}
            <Popup trigger={<button className='timeline-button'>EDIT</button>} position="right center">
              <div>Fill in this form!</div>
              <label for="tags">Select an Event Type:</label>
              <select id="tags" name="tags" onChange={(e) => {setEditTag(e.target.value)}} >
                <option value="Applied">Applied</option>
                <option value="Take Home Assessment">Take Home Assessment</option>
                <option value="Phone Screen">Phone Screen</option>
                <option value="Interview">Interview</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Final Round Interview">Final Round Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>


              </select>
              <input type='date' onChange={(e) => {setEditDate(e.target.value)}} />


              <button id='submitButton' onClick={() => submitEditEvent(event.id)}>Submit</button>
            </Popup>
            <button className='timeline-button' onClick={() => deleteEvent(event.id)}>DELETE</button>
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
