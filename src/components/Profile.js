// User profile page

import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { onAuthStateChanged, signOut, deleteUser, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential } from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { getStorage, ref } from "firebase/storage";
import { auth, db, storage } from '../firebase.js';
import './Profile.css';
import NavBarJTR from './Navbar.js';

export default function Profile() {

  const [pageReady, setReady] = useState(false);
  const [updateAcc, setUpdateAcc] = useState(false);
  const stock_img = 'https://firebasestorage.googleapis.com/v0/b/cse437-productivity-app-cc18b.appspot.com/o/profile_stock.png?alt=media&token=d908c915-c951-4fe8-8ea7-2a02b294269d';

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
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const profilePic = new Image();
        if (user.photoURL === null) { profilePic.src = stock_img }
        else { profilePic.src = stock_img }
        profilePic.onload = () => {
          setReady(true);
        }
      }
    });
  };

  // Deletes the user and removes all info from database
  const delUsr = async () => {
    const userUID = user.uid;
    await deleteDoc(doc(db, "users", userUID));

    deleteUser(user).then(() => {
      window.location.href = "/login";
    }).catch((error) => {
      console.log("error");
    });
  }

  // Allows users to edit profile
  const editProfile = async () => {
    setUpdateAcc(true);
  }

  // Reauthorizes users for certain actions
  const reauthUser = async () => {

  }

  if (!pageReady) {
    return (
      <>
        <p id='loadingPage'>Loading...</p>
      </>
    );
  }

  if (updateAcc) {
    return (
      <>
        <NavBarJTR></NavBarJTR>
        <h1>Update Account</h1>

        <Popup trigger={<button id="deleteAccount"> Delete Account </button>} modal={true}>
          <div id='warning'> Are you sure you want to delete this account?</div>
          <div id='warning2'> This action is irreversible! </div><br />
          <div id='deleteConfirm'><button onClick={delUsr} id='deleteConfirmButton'> Delete </button></div>
        </Popup>
      </>
    );
  } else {
    return (
      <>
        <NavBarJTR></NavBarJTR>
        <h1>Account Information</h1>

        <div id='imgDiv'> <img src={stock_img} /> </div>
        <div id='userName' class='userInfo'> {user.displayName}</div>
        <div id='userEmail' class='userInfo'> {user.email}</div>
        <br />
        <button id='edit' onClick={editProfile}> Edit or Delete Account </button>
      </>
    );
  }

}
