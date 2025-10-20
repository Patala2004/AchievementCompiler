import React from 'react';
import Header from "../Header"
import UserProfile from '../UserProfile';

export default function Home(){
    return (
        <React.StrictMode>
        <Header />
        <UserProfile />
        </React.StrictMode>
    )
}
