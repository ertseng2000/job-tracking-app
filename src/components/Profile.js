// User profile page
// IDEA Can potentially add option for profile pics in future
// TODO add a delete account confirmation

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Profile.css';

export default function Profile() {

  const user = auth.currentUser;

  // Firebase auth observer. Sends user back to login page if not signed in
  onAuthStateChanged(auth, (user) => {
    if (user === null) { window.location.href = "/login" }
  });

  const deleteUser = async () => {
    //TODO delete user
  }

  return (
    <>
      <h1>Profile Page</h1>
      <button id='deleteAccount' onClick={deleteUser}>Delete Account</button>
    </>
  )
}
