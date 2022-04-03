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
import RecruiterNavBarJTR from './Recruiter-NavBar.js';

export default function Applications() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);



  // Initializing states + variables
  const [applicantEmail, setApplicantEmail] = useState('');
  const [company, setCompany] = useState('');
  const [pageReady, setReady] = useState(false);
  const [searchedApplicant, setSearchedApplicant] = useState({
    name: '',
    email: '',
    id: ''
  });
  
  
  // Firebase auth observer. Sends user back to login page if not signed in
  const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCompany(user.displayName);
        setReady(true);
      } else {
        window.location.href="/recruiter-login"
      }
    });
  };

 
  const searchApplicant = async() => {
    const usersPath = 'users';
    const q = query(collection(db, usersPath), where("email", "==", applicantEmail));

    const querySnapshot = await getDocs(q);

    const res = querySnapshot.docs[0];
    if(typeof res !== "undefined"){
        console.log(res);
        setSearchedApplicant({
            name: res.data().name,
            email: res.data().email,
            id: res.id
        
        })
    }else{
        console.log("no results");
    }
    
  }
  
  

  
  const renderSearchedApplicant = () => {
      if(searchedApplicant.id !== ''){
          return <>
          <button id='applicantGo' onClick={() => goToAppListPage(searchedApplicant)}>{searchedApplicant.name}</button>
          </>;
      }return <>No Results</>;

  }
  const goToAppListPage = (searchedApplicant) =>{
    console.log(searchedApplicant)

    localStorage.setItem("applicantName", searchedApplicant.name);
    localStorage.setItem("applicantId", searchedApplicant.id);
    localStorage.setItem("applicantEmail", searchedApplicant.email);
    window.location.href="/recruiter-apps"
  }
  // Renders page after loading
  if (pageReady) {
    
    return (
      <>
        <RecruiterNavBarJTR></RecruiterNavBarJTR>
        <h1 id = "app-list-title">Enter An Applicant's Email</h1>
        <div id='emailInputWrapper'>
            <input type='text' placeholder='ex: jeffbezos@hotmail.com' onChange={(e) => {setApplicantEmail(e.target.value)}} />
        </div>

        <button id='submitButton' onClick={searchApplicant}>Search</button>

        <br></br>

        {renderSearchedApplicant()}
      </>
    );
  }

  return (
    <>
      <p id='loadingPage'>Loading...</p>
    </>
  );
}
