// Login page for JTR
// NOTE Will *consider* using FirebaseUI for Auth in next release (might be too lazy)
// https://firebase.google.com/docs/auth/web/firebaseui

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db, provider } from '../firebase.js';
import './Login.css';

export default function Login() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);

  // Initializing states
  const [email, setEmail] = useState('');
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log("Error code: " + error.code);
      console.log("Error message: " + error.message);
      errorHandler(error);
    }
  };

  // Login a user using GoogleAuthProvider
  // BUG: sign in w google after sign in w email/pw --> name not updated in firestore
  const loginGoogleUser = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setLoading(true);
      initUser(result.user);
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
    } else {
      setError("An unknown error occurred. Please try again later.");
    }
  };

  // Redirects to calendar if user already logged in
  const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
      if (user && user.displayName !== null) {
        window.location.href="/calendar";
      }
    });
  };

  // Initializes user in database upon registering
  const initUser = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userInfo = {
      name: user.displayName,
      email: user.email
    }
    await setDoc(userRef, userInfo, { merge: true });
  };

  // Sends reset password email
  const forgotPw = async (user) => {
    // TODO Can implement next release
  };

  // Page loading indicator for async/await stuff
  // IDEA Can add some animation or loading wheel in next release maybe
  if(loading) return (
    <p id='loadingPage'>Loading...</p>
  );

  return (
    <>
      <h1>Log In</h1>
      <br />
      <div id='name'>
        <input type='text' placeholder='Your Name' onChange={(e) => {setName(e.target.value)}} />
      </div>
      <div>
        <p id='errorMessage'>{errorMessage}</p>
      </div>
      <div id='registerLoginUser'>
        <input type='text' placeholder='email' onChange={(e) => {setEmail(e.target.value)}} />
        <input type='password' placeholder='password' onChange={(e) => {setPassword(e.target.value)}} />
        <button id='registerButton' onClick={registerUser}>Register</button>
        <button id='loginButton' onClick={loginUser}>Login</button>
        <button id='google' onClick={loginGoogleUser}>Use Google</button>
        <button id='forgotpwButton' onClick={forgotPw}>Forgot Password</button>
      </div>
    </>
  );
}
