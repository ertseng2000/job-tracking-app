import React, { useEffect, useState } from 'react';
import { onAuthStateChanged} from 'firebase/auth';
import { auth } from '../firebase.js';
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
            <h1 id="head">Your Job Applications, all in one place</h1>
            <br />
            <div id='registerLoginUser'>
                <button id='login-button' onClick={goToLogin}>Login</button>
                <button id='register-button' onClick={goToRegister}> Register</button>
                <button id='recruiter-button' onClick={(goToRecruiterLogin)}> Recruiter Site</button>
            </div>
        </>
    );
}
