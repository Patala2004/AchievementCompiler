import React from 'react';
import Header from "../Header"
import ProfilesOverview from "../ProfileLookAndSearch"

export default function Home(){
    return (
        <React.StrictMode>
        <Header />
        <ProfilesOverview />
        </React.StrictMode>
    )
}
