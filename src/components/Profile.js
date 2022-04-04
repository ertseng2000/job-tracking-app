// User profile page
// Yes, I realize this is a bit of a mess... I'll fix it if I got time

import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { onAuthStateChanged, deleteUser, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from '../firebase.js';
import './Profile.css';
import NavBarJTR from './Navbar.js';

export default function Profile() {

  const stock_img = 'https://firebasestorage.googleapis.com/v0/b/cse437-productivity-app-cc18b.appspot.com/o/profile_stock.png?alt=media&token=d908c915-c951-4fe8-8ea7-2a02b294269d';
  const [pageReady, setReady] = useState(false);
  const [updateAcc, setUpdateAcc] = useState(false);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pw, setOldPassword] = useState('');
  const [errorMessage, setError] = useState('');
  const [displayImg, setDisplayImg] = useState(stock_img);

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
        else {
          profilePic.src = user.photoURL;
          setDisplayImg(user.photoURL);
        }
        profilePic.onload = () => {
          setReady(true);
        }
      }
    });
  };

  // Deletes the user and removes all info from database
  const delUsr = async () => {
    await reauthUser();
    const userUID = user.uid;
    const desertRef = ref(storage, userUID + '/photo');
    try { await deleteDoc(doc(db, "users", userUID)) }
    catch (error) { console.log("No user applications found to delete.") }
    try { await deleteObject(desertRef) }
    catch (error) { console.log("No profile pic to delete") }

    deleteUser(user).then(() => {
      window.location.href = "/login";
    }).catch((error) => {
      console.log("error");
    });
  }

  // Submits profile edits to Firebase
  const submitEdits = async () => {
    if (name !== '') {
      try {
        await updateProfile(user, {
          displayName: name.trim()
        });
      } catch (error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        setError('Error changing name or profile photo!');
      }
    }

    if (photo !== '' && photo !== undefined && errorMessage === '') {
      const storageRef = ref(storage, user.uid + '/photo');
      try {
        setReady(false);
        await uploadBytes(storageRef, photo);
        const imgURL = await getDownloadURL(storageRef);
        setDisplayImg(imgURL);
        await updateProfile(user, {photoURL: imgURL});
        setReady(true);
      } catch (error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        setError('Error changing image!');
      }
    }

    if (email !== '') {
      await reauthUser();
      try {
        await updateEmail(user, email);
      } catch (error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        setError('Error changing email!');
      }
    }

    if (password !== confirmPassword) { setError('Password confirmation does not match!') }

    if (password !== '' && password === confirmPassword) {
      await reauthUser();
      try {
        await updatePassword(user, password);
      } catch (error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        setError('Error changing password!');
      }
    }

    if (errorMessage === '') { doneEditing() }
  }

  const editProfile = () => {
    setUpdateAcc(true);
    setError('');
  }

  const doneEditing = async () => {
    setUpdateAcc(false);
    setName('');
    setPhoto('');
    setEmail('');
    setPassword('');
    setOldPassword('');
    if (displayImg.charAt(0) === 'd' && user.photoURL === null) { // User leaves w/o saving profile, image shouldn't be saved
      setDisplayImg(stock_img);
    }
    if (user.photoURL != null) { setDisplayImg(user.photoURL) }
    const docRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(docRef, {
        email: user.email,
        name: user.displayName
      });
    }
    catch (error) { console.log("Error updating user email in db!") }
  }

  // Reauthorizes users for certain actions
  const reauthUser = async () => {
    const oldEmail = user.email;
    const userCredentials = EmailAuthProvider.credential(oldEmail, pw);
    try {
      await reauthenticateWithCredential(user, userCredentials);
    } catch (error) {
      console.log("Error code: " + error.code);
      console.log("Error message: " + error.message);
      setError('Error reauthorizing user!');
    }
  }

  // Confirms and display profile photo before uploading to Firebase
  if (photo !== '' && photo !== undefined) {
    if (photo.size > 5e6) {
      setPhoto('');
      setError('Photo too large! Please upload an image under 5MB');
    } else {
      let reader = new FileReader();
      reader.onload = function () {
        setDisplayImg(reader.result);
        setError('');
      }
      reader.readAsDataURL(photo);
    }
  }

  //if (password !== confirmPassword) { setError('Password confirmation does not match!') }

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
        <br />
        <p id='errorMessage'>{errorMessage}</p>
        <br />
        <div id='imgDiv'>
          <img src={displayImg} id='profImg' alt='profile pic' />
          <input type="file" accept="image/*" id="profilePic" onChange={(e) => setPhoto(e.target.files[0])} /><br />
        </div>
        <input type='text' placeholder='New name' onChange={(e) => {setName(e.target.value)}} /><br />
        <input type='text' placeholder='New email' onChange={(e) => {setEmail(e.target.value)}} /><br />
        <input type='password' placeholder='New password' onChange={(e) => {setPassword(e.target.value)}} /><br />
        <input type='password' placeholder='Repeat password' onChange={(e) => {setConfirmPassword(e.target.value)}} /><br />
        <br /><br />
        <p>Enter current password to apply changes or delete account</p>
        <input type='password' placeholder='Current password' onChange={(e) => {setOldPassword(e.target.value)}} /><br /><br />
        <button onClick={submitEdits}>Save Changes</button>
        <br /><br />
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
        <p id='errorMessage'>{errorMessage}</p>
        <br />
        <div id='imgDiv'> <img src={displayImg} id='profImg' alt='profile pic' /> </div>
        <div id='userName' class='userInfo'> {user.displayName}</div>
        <div id='userEmail' class='userInfo'> {user.email}</div>
        <br />
        <button id='edit' onClick={editProfile}> Edit or Delete Account </button>


      </>
    );
  }

}
