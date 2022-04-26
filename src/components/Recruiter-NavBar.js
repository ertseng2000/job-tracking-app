import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut} from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import './Profile.css';
import {Container, Navbar, Nav} from 'react-bootstrap';

export default function RecruiterNavBarJTR() {

  

  // Logs out user from site
  const logout = () => { signOut(auth).then(() => {}).catch(error => console.log("Error: " + error.message)) }

  return (
    <>
    <Navbar bg="light" expand="lg">
        <Container>
            <Navbar.Brand href="/recruiter-search">JTR</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav >
                <Nav.Link href="/recruiter-search">Applicant Search</Nav.Link>
                <Nav.Link onClick={logout}>Log Out</Nav.Link>
            </Nav>
            </Navbar.Collapse>
        </Container>
     </Navbar>
    </>
  )
}