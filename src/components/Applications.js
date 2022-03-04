// Displays list of applications

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, setDoc, addDoc, orderBy, limit, getDocs} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Applications.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import NavBarJTR from './Navbar.js';

export default function Applications() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);



  // Initializing states + variables
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('');
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
        setName(user.displayName);
        getFirestoreData(auth.currentUser);
        setReady(true);
      } else {
        window.location.href="/login"
      }
    });
  };

  // TODO setup a listener using onSnapshot to query all user application documents to display
  // Can use some of the code from listener in Calendar.js 
  // https://firebase.google.com/docs/firestore/query-data/listen
  
  const getFirestoreData = (currentUser) => {
    const appPath = 'users/' + currentUser.uid + '/applications';
    const dataQuery = query(collection(db, appPath));
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
    console.log(company);
    console.log(position);
    console.log(status);
    console.log(notes);
    const appPath = 'users/' + auth.currentUser.uid + '/applications';
    await setDoc(doc(collection(db, appPath)), {
      companyName: company,
      currentStatus: status,
      position: position,
      notes: notes
    });
  };
  
  const goToTimeLine = (application) => {
    
    localStorage.setItem('currCompany', application.company);
    localStorage.setItem('currCompanyId', application.id);
    window.location.href = "/timeline";
  };

  
  
  // Renders page after loading
  if (pageReady) {
    
    return (
      <>
        <NavBarJTR></NavBarJTR>
        <h1 id = "app-list-title">{name}'s Applications</h1>
        
        

        <Popup trigger={<button id = "new-app-button">New Application</button>} position="right center">
          <div>Fill in this form!</div>
          <input type='text' placeholder='Company Name' onChange={(e) => {setCompany(e.target.value)}} />
          <input type='text' placeholder='Position' onChange={(e) => {setPosition(e.target.value)}} />
          <input type='text' placeholder='Status' onChange={(e) => {setStatus(e.target.value)}} />
          <input type='text' placeholder='Notes' onChange={(e) => {setNotes(e.target.value)}} />

          <button id='submitButton' onClick={submitApplication}>Submit</button>
        </Popup>

        <br />
        <Container>
          <Row id = "headings">
            <Col>Company</Col>
            <Col>Position</Col>
            <Col>Status</Col>
            <Col>Notes</Col>
            <Col>Update/View</Col>
          </Row>
          {applications.map((application) =>
            
            <Row className = "table-content">
            <Col>{application.company}</Col>
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
