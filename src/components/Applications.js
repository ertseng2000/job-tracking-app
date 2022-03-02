// Displays list of applications

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, setDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Applications.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


export default function Applications() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);

  // Initializing states + variables
  const [name, setName] = useState('');
  const [pageReady, setReady] = useState(false);
  const [applications, setApplications] = useState([{
    company: '',
    position: '',
    status: '',
    notes: ''
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
        notes: doc.data().notes
      })));
    });
  }
  // TODO use addDoc and/or setDoc to add new applications
  // https://firebase.google.com/docs/firestore/manage-data/add-data
  // Path: users/user.uid/applications/[auto-generated ID application]/[auto-gen ID update document]


  // Logs out user from site
  const logout = () => { signOut(auth).then(() => {}).catch(error => console.log("Error: " + error.message)) }

  // Moves to app list page
  const calendar = () => window.location.href = "/calendar";
  
  // Navigates user to profile page
  const profile = () => window.location.href = "/profile";
  
  
  // Renders page after loading
  if (pageReady) {
    
    return (
      <>
        <h1>{name}'s Applications</h1>
        
        <nav>
          <button onClick={profile}>Profile</button>
          <button onClick={logout}>Logout</button>
          <button onClick={calendar}>Calendar</button>
        </nav>
        <br />
        <Container>
          <Row id = "headings">
            <Col>Company</Col>
            <Col>Position</Col>
            <Col>Status</Col>
            <Col>Notes</Col>
          </Row>
          {applications.map((application) =>
            
            <Row>
            <Col>{application.company}</Col>
            <Col>{application.position}</Col>
            <Col>{application.status}</Col>
            <Col>{application.notes}</Col>
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
