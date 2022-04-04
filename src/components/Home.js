import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db, provider } from '../firebase.js';
import './Home.css';

const goToRegister = () => {
    window.location.href="/register";
};

const goToLogin = () => {
    window.location.href="/login";
};

const goToRecruiterLogin = () => {
    window.location.href="/recruiter-login";
};

const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
        if (user && user.displayName !== null) {
            window.location.href="/calendar";
        }
    });
};

export default function Home(){
    useEffect(() => {
        checkIfSignedIn();
    }, []);

    return(
        <>
            <h1 id = "head">You Job Applications, all in one place</h1>
            <br />

            <div id='registerLoginUser'>

                <button id='login-button' onClick={goToLogin}>Login</button>
                <br></br>
                <button id='register-button' onClick={goToRegister}> Don't have an account? Register Now!</button>
                <button id='recruiter-button' onClick={(goToRecruiterLogin)}> I'm a recruiter</button>
            </div>
        </>
    );
}
