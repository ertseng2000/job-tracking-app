// Displays list of applications

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, setDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Applications.css';

export default function Applications() {

  const user = auth.currentUser;

  // Firebase auth observer. Sends user back to login page if not signed in
  onAuthStateChanged(auth, (user) => {
    if (user === null) { window.location.href = "/login" }
  });

  // TODO setup a listener using onSnapshot to query all user application documents to display
  // Can use some of the code from listener in Calendar.js 
  // https://firebase.google.com/docs/firestore/query-data/listen

  // TODO use addDoc and/or setDoc to add new applications
  // https://firebase.google.com/docs/firestore/manage-data/add-data
  // Path: users/user.uid/applications/[auto-generated ID application]/[auto-gen ID update document]

  return (
    <>
    </>
  );
}
