import React, { useEffect, useState } from 'react';
import { onAuthStateChanged} from 'firebase/auth';
import { auth } from '../firebase.js';
import './Home.css';
import { ChakraProvider, Stack, Button, extendTheme } from '@chakra-ui/react';

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

const theme = extendTheme({
    "colors": {
        "gray": {
            "50": "#EEF1F6",
            "100": "#D0D8E6",
            "200": "#B2BFD6",
            "300": "#95A5C6",
            "400": "#778CB6",
            "500": "#5973A6",
            "600": "#475C85",
            "700": "#354564",
            "800": "#232E43",
            "900": "#121721"
        }
    }
});

export default function Home(){
    useEffect(() => {
        checkIfSignedIn();
    }, []);

    return(
        <ChakraProvider theme={theme}>
            <h1 id="head">Your Job Applications, all in one place</h1>
            <Stack maxWidth='60vw' margin='auto'>
                <Stack direction={['column', 'row']} maxWidth='60vw' margin='auto' spacing='5vw'>
                    <Button colorScheme='gray' size='lg' variant='solid' onClick={goToLogin}>Login</Button>
                    <Button colorScheme='gray' size='lg' variant='solid' onClick={goToRegister}>Register</Button>
                    <Button colorScheme='gray' size='lg' variant='solid' onClick={goToRecruiterLogin}>Recruiter Site</Button>
                </Stack>
            </Stack>
        </ChakraProvider>
    );
}
