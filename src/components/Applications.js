// Displays list of applications

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, setDoc} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Applications.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import NavBarJTR from './Navbar.js';
import { ChakraProvider, Button} from '@chakra-ui/react';

export default function Applications() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);



  // Initializing states + variables
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [statusFilter, setStatusFilter] = useState('None');
  
  
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
        window.location.href="/home";
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
    console.log(notes);
    const appPath = 'users/' + auth.currentUser.uid + '/applications';
    await setDoc(doc(collection(db, appPath)), {
      companyName: company,
      currentStatus: "No Statuses Yet",
      position: position,
      notes: notes
    });
  };
  
  const goToTimeLine = (application) => {
    
    localStorage.setItem('currCompany', application.company);
    localStorage.setItem('currCompanyId', application.id);
    window.location.href = "/timeline";
  };

  
  const getFilteredApplications = () =>{
    var filteredApplications = applications;
    if(statusFilter !== 'None'){
      filteredApplications = filteredApplications.filter((application => trimStatus(application.status) === statusFilter))
    }
    return filteredApplications;
  }

  const handleStatusFilterChange = (event) =>{
    console.log(event.target.value)
    setStatusFilter(event.target.value)
  }

  //Remove date from statusString
  //Ex: Interview Wed Apr 13 2022  -> Interview
  const trimStatus =  (statusString) =>{
    //Date string is 15 chars, + a space between status and date
    return statusString.substring(0, statusString.length - 16)
  }
  // Renders page after loading
  if (pageReady) {
    
    return (
      <ChakraProvider>
        <NavBarJTR></NavBarJTR>
        <h1 id = "app-list-title">{name}'s Applications</h1>
        
        
        {
          /*
          
          <Popup trigger={<button id = "new-app-button">New Application</button>} position="right center">
          <div>Fill in this form!</div>
          <input type='text' placeholder='Company Name' onChange={(e) => {setCompany(e.target.value)}} />
          <input type='text' placeholder='Position' onChange={(e) => {setPosition(e.target.value)}} />
          
          <input type='text' placeholder='Notes' onChange={(e) => {setNotes(e.target.value)}} />

          <button id='submitButton' onClick={submitApplication}>Submit</button>
        </Popup>
          */
        }
        

        <br />
        <Container>
          <Row id = "headings">
            <Col>Company</Col>
            <Col>Position</Col>
            <Col>Status
            
            <select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="None">None</option>
              <option value="Applied">Applied</option>
              <option value="Take Home Assessment">Take Home Assessment</option>
              <option value="Phone Screen">Phone Screen</option>
              <option value="Interview">Interview</option>
              <option value="Technical Interview">Technical Interview</option>
              <option value="Final Round Interview">Final Round Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            </Col>
            <Col>Notes</Col>
            <Col>Update/View</Col>
          </Row>
          {getFilteredApplications().map((application) =>
            
            <Row className = "table-content">
            <Col>{application.company}</Col>
            <Col>{application.position}</Col>
            <Col>{application.status}</Col>
            <Col>
            
            <Popup trigger={<Button id = "notes-button" colorScheme='gray' variant='ghost' size='sm'>Notes</Button>} position="right center" on="hover">
              {application.notes}
            </Popup>
            
            </Col>
            <Col>
            <button className='go-button' onClick={() => {goToTimeLine(application)}}>Go!</button>
            </Col>
          </Row>
          )}
          
        </Container>
      </ChakraProvider>
    );
  }

  return (
    <>
      <p id='loadingPage'>Loading...</p>
    </>
  );
}
