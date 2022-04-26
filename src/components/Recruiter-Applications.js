// Displays list of applications

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where, setDoc, addDoc, orderBy, limit, getDocs} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Recruiter-Applications.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import RecruiterNavBarJTR from './Recruiter-NavBar.js';

export default function RecruiterApplications() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);


  const applicantName = localStorage.getItem('applicantName');
  const applicantId = localStorage.getItem('applicantId');
  const applicantEmail = localStorage.getItem('applicantEmail');


  // Initializing states + variables
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [pageReady, setReady] = useState(false);
  const [applications, setApplications] = useState([{
    company: '',
    position: '',
    status: '',
    notes: '',
    id: ''
  }]);

  // Firebase auth observer. Sends user back to login page if not signed in
  const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        checkIfRecruiter(user);
        setName(user.displayName);
        getFirestoreData();
        setReady(true);
      } else {
        window.location.href="/recruiter-login"
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

  // TODO setup a listener using onSnapshot to query all user application documents to display
  // Can use some of the code from listener in Calendar.js
  // https://firebase.google.com/docs/firestore/query-data/listen

  const getFirestoreData = () => {
    const appPath = 'users/' + applicantId + '/applications';

    const dataQuery = query(collection(db, appPath), where("companyName", "==", auth.currentUser.displayName));
    const unsubscribe = onSnapshot(dataQuery, (querySnapshot) => {
      setApplications(querySnapshot.docs.map(doc => ({
        company: doc.data().companyName,
        position: doc.data().position,
        status: doc.data().currentStatus,
        notes: doc.data().notes,
        id: doc.id
      })));

    });
  }
  // TODO use addDoc and/or setDoc to add new applications
  // https://firebase.google.com/docs/firestore/manage-data/add-data
  // Path: users/user.uid/applications/[auto-generated ID application]/[auto-gen ID update document]
  const submitApplication = async () => {
    console.log(position);
    console.log(notes);
    const appPath = 'users/' + applicantId + '/applications';
    await setDoc(doc(collection(db, appPath)), {
      companyName: name,
      currentStatus: "No Statuses Yet",
      position: position,
      notes: notes
    });
  };

  const goToTimeLine = (application) => {

    localStorage.setItem('currCompany', application.company);
    localStorage.setItem('applicationId', application.id);
    window.location.href = "/recruiter-timeline";
  };



  // Renders page after loading
  if (pageReady) {

    return (
      <>
        <RecruiterNavBarJTR></RecruiterNavBarJTR>
        <h1 id = "app-list-title">{applicantName}'s Applications to {name}</h1>



        <Popup trigger={<button id = "new-app-button">New Application</button>} position="right center">
          <div>Fill in this form!</div>
          <input type='text' placeholder='Position' onChange={(e) => {setPosition(e.target.value)}} />

          

          <button id='submitButton' onClick={submitApplication}>Submit</button>
        </Popup>

        <br />
        <Container>
          <Row id = "headings">

            <Col>Position</Col>
            <Col>Status</Col>
            <Col>Notes</Col>
            <Col>Update/View</Col>
          </Row>
          {applications.map((application) =>

            <Row className = "table-content">

            <Col>{application.position}</Col>
            <Col>{application.status}</Col>
            <Col>{application.notes}</Col>
            <Col>
            <button className='go-button' onClick={() => {goToTimeLine(application)}}>Go!</button>
            </Col>
          </Row>
          )}

        </Container>
      </>
    );
  }

  return (
    <>
      <p id='loadingPage'>Loading...</p>
    </>
  );
}
