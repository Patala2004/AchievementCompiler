import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import LoginForm from "./components/LoginForm";
import Header from "./components/Header"
import Logout from "./components/Sites/Logout"
import Login from "./components/Sites/Login"
import Profile from "./components/Sites/Profile"
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Sites/Home"
import UserProfile from './components/Sites/UserProfile';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/Profile/:id" element={<UserProfile />} />   {/* Dynamic user */}
      <Route path="/Logout" element={<Logout />} />
    </Routes>
  </BrowserRouter>
);

