// Login page for JTR
// NOTE Will *consider* using FirebaseUI for Auth in next release (might be too lazy)
// https://firebase.google.com/docs/auth/web/firebaseui

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, provider } from '../firebase.js';
import './Recruiter-Login.css';
import { ChakraProvider, Stack, Button, FormControl, FormErrorMessage, FormLabel, Input} from '@chakra-ui/react';

export default function RecruiterRegistration() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);

  // Firebase auth observer
  // onAuthStateChanged(auth, (user) => {
  //   if (user !== null) { window.location.href = "/recruiter-search" }
  // });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register a user with email & pw using Firebase Auth
  const registerUser = async () => {
    try {
      if (name.trim() === '') {
        throw "empty name";
      } else if (/\s/.test(name)) {
        throw "name spaces";
      } else if (password !== confirmPassword) {
        throw "password no match";
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
    } else if (error == "name spaces") {
      setError("Please omit spaces from company name!");
    } else if (error == "password no match") {
      setError("Passwords do not match!");
    } else {
      setError("An unknown error occurred. Please try again later.");
    }
  };

  // Redirects to calendar if user already logged in
  const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
      if (user && user.displayName !== null) {
        window.location.href="/recruiter-search";
      }
    });
  };

  // Initializes user in database upon registering
  const initUser = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userInfo = {
      name: user.displayName,
      email: user.email,
      isRecruiter: "true"
    }
    await setDoc(userRef, userInfo, { merge: true });
    window.location.href="/recruiter-search";
  };

  // Sends reset password email
  const forgotPw = async (user) => {
    // TODO Can implement next release
  };
  const goToApplicantLogin = () => {
    window.location.href="/login";
  };

  const goToRecruiterLogin = () =>{
    window.location.href="/recruiter-login";
  }
  // Page loading indicator for async/await stuff
  // IDEA Can add some animation or loading wheel in next release maybe
  if(loading) return (
    <p id='loadingPage'>Loading...</p>
  );

  return (
    <>
      

      <ChakraProvider>
            <h1 id="head">JTR Recruiter Registration</h1>
            <form onSubmit={registerUser}>
                <Stack maxWidth='60vw' margin='auto' spacing='2vh'>
                    <FormControl isRequired>
                        <FormLabel htmlfor='name' requiredIndicator>Company Name</FormLabel>
                        <Input
                            id='name'
                            type='name'
                            onChange={(e) => {setName(e.target.value)}}
                        />
                    </FormControl>
                    
                    <Stack direction={['column', 'row']} maxWidth='60vw' margin='auto' spacing='2vw'>
                        <FormControl isRequired>
                            <FormLabel htmlfor='password-input' requiredIndicator>Password</FormLabel>
                            <Input
                                id='password-input'
                                type='password'
                                onChange={(e) => {setPassword(e.target.value)}}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel htmlfor='password-input-c' requiredIndicator>Confirm Password</FormLabel>
                            <Input
                                id='password-input-c'
                                type='password'
                                onChange={(e) => {setConfirmPassword(e.target.value)}}
                            />
                        </FormControl>
                    </Stack>
                    <p id='errorMessage'>{errorMessage}</p>
                    <FormControl>
                        <Button colorScheme='teal' size='sm' variant='outline' type='submit' isLoading={loading}>Register</Button>
                    </FormControl>
                </Stack>
            </form>
            <Stack maxWidth='25vw' margin='auto' spacing='2vh' marginTop='5vh'>
                <Button colorSceme='teal' size='sm' variant='ghost' onClick={goToRecruiterLogin}>Already have an account? Log In!</Button>
                <Button colorSceme='teal' size='sm' variant='ghost' onClick={goToApplicantLogin}>I'm an applicant</Button>
            </Stack>
        </ChakraProvider>
    </>
  );
}
