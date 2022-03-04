// User profile page
// IDEA Can potentially add option for profile pics in future
// TODO add a delete account confirmation

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Profile.css';
import NavBarJTR from './Navbar.js';

export default function Profile() {

  useEffect(() => {
    checkIfSignedIn();
  }, []);

  const user = auth.currentUser;

  // Firebase auth observer. Sends user back to login page if not signed in
  onAuthStateChanged(auth, (user) => {
    if (user === null) { window.location.href = "/login" }
  });

  // Firebase auth observer. Sends user back to login page if not signed in
  const checkIfSignedIn = () => {
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
      if (user === null) {
        window.location.href="/login";
        deleteUser(user);
      }
    });
  };

  // Deletes the user and removes all info from database
  const deleteUser = async (currentUser) => {
    //TODO delete user
    await getFirestoreData(currentUser);
  }

  // Query all user data
  const getFirestoreData = (currentUser) => {
    let userAppIDs = [];
    const userPath = 'users/' + currentUser.uid + '/applications';
    // TODO finish this
  }

  return (
    <>
      <NavBarJTR></NavBarJTR>
      <h1>Profile Page</h1>
      <button id='deleteAccount' onClick={deleteUser}>Delete Account</button>
    </>
  )
}
