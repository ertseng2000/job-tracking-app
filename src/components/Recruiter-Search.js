// Displays list of applications

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, getDoc, getDocs} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Recruiter-Search.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import RecruiterNavBarJTR from './Recruiter-NavBar.js';


export default function RecruiterSearch() {

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
        checkIfRecruiter(user);
        setCompany(user.displayName);
        setReady(true);
      } else {
        window.location.href="/recruiter-login";
      }
    });
  };

  const checkIfRecruiter = async (currUser) => {
    const docRef = doc(db, "users", currUser.uid)
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (docSnap.data().isRecruiter === null || docSnap.data().isRecruiter === undefined) {
        window.location.href="/recruiter-login"
      }
    } else {
      console.log("Error reading isRecruiter flag");
      }
  }

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
        setSearchedApplicant({
          name: '',
          email: '',
          id: ''

      })
    }

  }




  const renderSearchedApplicant = () => {
      if(searchedApplicant.id !== ''){
          return <>
         
          We found {searchedApplicant.name}'s profile:
          <br></br>
          <button className='go-button' onClick={() => goToAppListPage(searchedApplicant)}>Go!</button>
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
        <h1 id = "search-head">Enter An Applicant's Email</h1>
        <div id='email-input-wrapper'>
            <input type='text' id = "searchTextInput" placeholder='ex: jeffbezos@hotmail.com' onChange={(e) => {setApplicantEmail(e.target.value)}} />
            <button id='searchButton' onClick={searchApplicant}> Search! </button>
        </div>

        
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
