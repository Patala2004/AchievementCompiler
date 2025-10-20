import React from 'react';
import Header from "../Header"
import LoginForm from '../LoginForm';

export default function Home(){
    return (
        <React.StrictMode>
        <Header />
        <br></br>
        <LoginForm />
        </React.StrictMode>
    )
}
