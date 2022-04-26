// Login page for JTR
// NOTE Will *consider* using FirebaseUI for Auth in next release (might be too lazy)
// https://firebase.google.com/docs/auth/web/firebaseui

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, provider } from '../firebase.js';
import './Recruiter-Login.css';
import { ChakraProvider } from '@chakra-ui/react';
import { Stack, Button, FormControl, FormErrorMessage, FormLabel, Input} from '@chakra-ui/react';

export default function RecruiterLogin() {

  var recruiter = true;

  useEffect(() => {
    checkIfSignedIn();
  }, []);

  // Firebase auth observer
  // onAuthStateChanged(auth, (user) => {
  //   if (user !== null) { window.location.href = "/recruiter-search" }
  // });

  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register a user with email & pw using Firebase Auth
  const registerUser = async () => {
    try {
      if (name.trim() === '') {
        throw "empty name";
      }
      setLoading(true);
      const email = name + "@"+ name+".com";
      console.log(email);
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredentials.user, {
        displayName: name.trim()
      });
      await initUser(userCredentials.user);
    } catch (error) {
      console.log("Error code: " + error.code);
      console.log("Error message: " + error.message);
      errorHandler(error);
    }
  };

  // Login a user with email & pw using Firebase Auth
  const loginUser = async () => {
    try {
      setLoading(true);
      const email = name + "@"+ name+".com";
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log("Error code: " + error.code);
      console.log("Error message: " + error.message);
      errorHandler(error);
    }
  };



  // Handles potential errors during login
  const errorHandler = (error) => {
    setLoading(false);
    if (error.code == "auth/email-already-in-use") {
      setError("Cannot register user, email already in use! Please try resetting password!");
    } else if (error.code == "auth/weak-password") {
      setError("Password must be at least 6 characters long!");
    } else if (error.code == "auth/invalid-email" || error.code == "auth/user-not-found" || error.code == "auth/wrong-password") {
      setError("Login details are invalid. Please try again.");
    } else if (error == "empty name") {
      setError("A valid name is required to register!");
    } else if (error = "is applicant") {
      setError("User is already an applicant and cannot be a recruiter!");
    } else {
      setError("An unknown error occurred. Please try again later.");
    }
  };

  // Redirects to calendar if user already logged in
  const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
      if (user && user.displayName !== null) {
        checkIfRecruiter(user);
        if (recruiter) {
          window.location.href="/recruiter-search";
        }
      }
    });
  };

  const checkIfRecruiter = async (currUser) => {
    const docRef = doc(db, "users", currUser.uid)
    const docSnap = await getDoc(docRef);

    try {
      if (docSnap.exists()) {
        if (docSnap.data().isRecruiter === null || docSnap.data().isRecruiter === undefined) {
          recruiter = false;
          throw "is applicant";
        }
      }
    } catch (error) {
      errorHandler(error);
    }

  }

  // Initializes user in database upon registering
  const initUser = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userInfo = {
      name: user.displayName,
      email: user.email,
      isRecruiter: "true"
    }
    await setDoc(userRef, userInfo, { merge: true });
  };

  // Sends reset password email
  const forgotPw = async (user) => {
    // TODO Can implement next release
  };
  const goToApplicantLogin = () => {
    window.location.href="/login";
  };
  const goToRecruiterRegister = () => {
    window.location.href="/recruiter-registration";
  };

  // Page loading indicator for async/await stuff
  // IDEA Can add some animation or loading wheel in next release maybe
  if(loading) return (
    <p id='loadingPage'>Loading...</p>
  );

  return (
    <>

      <ChakraProvider>
        <h1 id="head">JTR  Recruiter Login</h1>
        <form onSubmit={loginUser}>
          <Stack maxWidth='60vw' margin='auto' spacing='2vh'>
            <FormControl isRequired>
              <FormLabel htmlfor='email'>Company Name</FormLabel>
              <Input
                  id='email-input'
                  
                  onChange={(e) => {setName(e.target.value)}}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlfor='password'>Password</FormLabel>
              <Input
                  id='password-input'
                  type='password'
                  onChange={(e) => {setPassword(e.target.value)}}
              />
            </FormControl>
            <p id='errorMessage'>{errorMessage}</p>
            <FormControl>
              <Button colorScheme='teal' size='sm' variant='outline' type='submit'>Login</Button>
            </FormControl>
          </Stack>
        </form>
        <Stack maxWidth='25vw' margin='auto' spacing='2vh' marginTop='5vh'>
          <Button colorSceme='teal' size='sm' variant='ghost' onClick={goToRecruiterRegister}>Don't have an account? Register Now!</Button>
          <Button colorSceme='teal' size='sm' variant='ghost' onClick={goToApplicantLogin}>I'm an applicant</Button>
        </Stack>
      </ChakraProvider>
    </>
    
  );
}
