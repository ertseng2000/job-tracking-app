// User profile page

import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { onAuthStateChanged, signOut, deleteUser, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { getStorage, ref } from "firebase/storage";
import { auth, db, storage } from '../firebase.js';
import './Profile.css';
import NavBarJTR from './Navbar.js';

export default function Profile() {

  const [pageReady, setReady] = useState(false);
  const [updateAcc, setUpdateAcc] = useState(false);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pw, setOldPassword] = useState('');
  const [errorMessage, setError] = useState('');

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

  const submitEdits = async () => {
    if (name != '') {
      try {
        await updateProfile(user, {
          displayName: name.trim()
        });
      } catch (error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        setError(errorMessage + 'Error changing name or profile photo!');
      }
    }

    if (email != '') {
      reauthUser();
      try {
        await updateEmail(user, email);
      } catch (error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        setError(errorMessage + 'Error changing email!');
      }
    }

    if (password != '') {
      reauthUser();
      try {
        await updatePassword(user, password);
      } catch (error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        setError(errorMessage + 'Error changing password!');
      }
    }
    
    doneEditing();
  }

  const editProfile = () => {
    setUpdateAcc(true);
    setError('');
  }

  const doneEditing = () => { setUpdateAcc(false) }

  // Reauthorizes users for certain actions
  const reauthUser = async () => {
    const userCredentials = EmailAuthProvider.credential(user.email, pw);
    try {
      await reauthenticateWithCredential(user, userCredentials);
    } catch (error) {
      console.log("Error code: " + error.code);
      console.log("Error message: " + error.message);
      setError('Error reauthorizing user!');
    }
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
        <h1 class='profileHeader'>Update Account</h1>

        <input type='text' placeholder='New name' onChange={(e) => {setName(e.target.value)}} /><br />
        <input type='text' placeholder='New email' onChange={(e) => {setEmail(e.target.value)}} /><br />
        <input type='password' placeholder='New password' onChange={(e) => {setPassword(e.target.value)}} /><br />
        <br /><br />
        <input type='password' placeholder='Current password' onChange={(e) => {setOldPassword(e.target.value)}} />
        <button onClick={submitEdits}>Submit Changes</button>
        <br />
        <button onClick={doneEditing}>Return to profile</button>
        <br />
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
        <h1 class='profileHeader'>Account Information</h1>
        <div>
          <p id='errorMessage'>{errorMessage}</p>
        </div>
        <div id='imgDiv'> <img src={stock_img} id='profImg'/> </div>
        <div id='userName' class='userInfo'> {user.displayName}</div>
        <div id='userEmail' class='userInfo'> {user.email}</div>
        <br />
        <button id='edit' onClick={editProfile}> Edit or Delete Account </button>
      </>
    );
  }

}
