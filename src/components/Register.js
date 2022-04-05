import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db, provider } from '../firebase.js';
import './Register.css';

export default function Register() {

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
const [errorMessage, setError] = useState('');
const [loading, setLoading] = useState(false);

useEffect(() => {
  checkIfSignedIn();
}, []);

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
        window.location.href="/calendar";
    } catch (error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        errorHandler(error);
        }
    };

    const initUser = async (user) => {
        const userRef = doc(db, "users", user.uid);
        const userInfo = {
            name: user.displayName,
            email: user.email
        }
        await setDoc(userRef, userInfo, { merge: true });
        window.location.href="/calendar";
    };

    const checkIfSignedIn = () => {
        const user = auth.currentUser;
        onAuthStateChanged(auth, (user) => {
            if (user && user.displayName !== null) {
                window.location.href="/calendar";
            }
        });
    };
    const goToLogin= () => {
        window.location.href="/login";
      };
    
      const goToRecruiterLogin = () => {
        window.location.href="/recruiter-login";
      };

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
    return (
        <>
            <h1 id = "head">JTR Registration</h1>
            <br />
            <div id='name'>
                <input type='text' placeholder='Your Name' onChange={(e) => {setName(e.target.value)}} />
            </div>
            <div>
                <p id='errorMessage'>{errorMessage}</p>
            </div>
            <div id='registerLoginUser'>
                <input id = 'email-input' type='text' placeholder='email' onChange={(e) => {setEmail(e.target.value)}} />
                <input id = 'password-input' type='password' placeholder='password' onChange={(e) => {setPassword(e.target.value)}} />
                <button id='register-button' onClick={registerUser}>Register</button>
                <br></br>
                <button id='login-button' onClick={goToLogin}>Already have an account? Log In!</button>
                <button id='recruiter-button' onClick={(goToRecruiterLogin)}> I'm an recruiter</button>
            </div>
        </>
    );
}
