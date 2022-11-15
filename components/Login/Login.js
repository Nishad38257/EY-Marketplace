import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';


import {useState} from 'react';


export default function Login(props) {
    const [emailInput, setEmailInput] = useState();
    const [passwordInput, setPasswordInput] = useState()

    const handleEmailChange = (e) => {
        setEmailInput(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPasswordInput(e.target.value);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (emailInput === 'User' && passwordInput === 'user@123') {
            props.LoggedIn(true)
            props.AdminFlag(false)
        }
        else if (emailInput === 'Admin' && passwordInput === 'admin@123') {
            props.AdminFlag(true)
            props.LoggedIn(true)
        }  else {
            alert('Invalid Username or Password')
        }

    };

    return (
        <div className='main'>
            <Container component="main" maxWidth="xs" className='container'>
                <Box className='login-box'>


                    <h2>
                        <center><Avatar src="/broken-image.jpg"
                                sx={
                                    {backgroundColor: '#d21919'}
                                }/>Sign in</center>
                    </h2>

                    <Box component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={
                            {mt: 1}
                    }>
                        <TextField margin="normal" fullWidth id="name" label="Username" name="email" autoComplete="email" autoFocus
                            onChange={handleEmailChange}/>
                        <TextField margin="normal" fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password"
                            onChange={handlePasswordChange}/>

                        <Button type="submit" fullWidth variant="contained"
                            sx={
                                {
                                    mt: 3,
                                    mb: 2
                                }
                        }>
                            Sign In
                        </Button>

                    </Box>
                </Box>

            </Container>
        </div>
    );
}
