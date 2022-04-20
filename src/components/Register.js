import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db, provider } from '../firebase.js';
import './Register.css';
import { ChakraProvider, Stack, Button, FormControl, FormErrorMessage, FormLabel, Input} from '@chakra-ui/react';

export default function Register() {

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [name, setName] = useState('');
const [errorMessage, setError] = useState('');
const [loading, setLoading] = useState(false);

useEffect(() => {
  checkIfSignedIn();
}, []);

const registerUser = async (event) => {
    event.preventDefault();
    try {
        if (name.trim() === '') {
            throw "empty name";
        } else if (password !== confirmPassword) {
          throw "password no match";
        }
        setLoading(true);
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredentials.user, {
            displayName: name.trim()
        });
        await initUser(userCredentials.user);
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
        } else if (error === "empty name") {
            setError("A valid name is required to register!");
        } else if (error === "password no match") {
            setError("Passwords do not match!");
        } else {
            setError("An unknown error occurred. Please try again later.");
        }
    };

    return (
        <ChakraProvider>
            <h1 id="head">JTR Registration</h1>
            <form onSubmit={registerUser}>
                <Stack maxWidth='60vw' margin='auto' spacing='2vh'>
                    <FormControl isRequired>
                        <FormLabel htmlfor='name' requiredIndicator>Your Name</FormLabel>
                        <Input
                            id='name'
                            type='name'
                            onChange={(e) => {setName(e.target.value)}}
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel htmlfor='email-input' requiredIndicator>Email Address</FormLabel>
                        <Input
                            id='email-input'
                            type='email'
                            onChange={(e) => {setEmail(e.target.value)}}
                        />
                    </FormControl>
                    <Stack direction={['column', 'row']} maxWidth='60vw' margin='auto' spacing='2vw'>
                        <FormControl isRequired>
                            <FormLabel htmlfor='password-input' requiredIndicator>Password</FormLabel>
                            <Input
                                id='password-input'
                                type='password'
                                onChange={(e) => {setPassword(e.target.value)}}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel htmlfor='password-input-c' requiredIndicator>Confirm Password</FormLabel>
                            <Input
                                id='password-input-c'
                                type='password'
                                onChange={(e) => {setConfirmPassword(e.target.value)}}
                            />
                        </FormControl>
                    </Stack>
                    <p id='errorMessage'>{errorMessage}</p>
                    <FormControl>
                        <Button colorScheme='teal' size='sm' variant='outline' type='submit' isLoading={loading}>Register</Button>
                    </FormControl>
                </Stack>
            </form>
            <Stack maxWidth='25vw' margin='auto' spacing='2vh' marginTop='5vh'>
                <Button colorSceme='teal' size='sm' variant='ghost' onClick={goToLogin}>Already have an account? Log In!</Button>
                <Button colorSceme='teal' size='sm' variant='ghost' onClick={goToRecruiterLogin}>I'm a recruiter</Button>
            </Stack>
        </ChakraProvider>
    );
}
