// src/components/FrontendExample.tsx
import React, { useEffect, useState } from "react";
import { loginUser, getAuthenticatedUser, signUpUser } from "../api/userApi";
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        if (localStorage.getItem("token") == null) throw new Error("No token");
        await getAuthenticatedUser();
        navigate('/')
      } catch (err) {

      }
    }
    fetchUser();
  }, []);

  const navigate = useNavigate();

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { user, access_token } = await loginUser(username, password);
      localStorage.setItem("token", access_token);
      setUserInfo(user);
      navigate('/');
    } catch (err: any) {
      setError("Invalid username or password");
      console.error(err);
    }
  };

  // Signup Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { user, access_token } = await signUpUser(username, password);
      localStorage.setItem("token", access_token);
      setUserInfo(user);
      navigate('/');
    } catch (err: any) {
      setError(`Already existing user. Please try another username.\n${err.message}`)
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 rounded-lg shadow-lg space-y-4 bg-[#1F2A38]">
      <h2 className="text-2xl font-semibold text-center text-white mb-4">
        Login / Sign Up
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-600 bg-[#2C3848] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-600 bg-[#2C3848] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <button
          type="submit"
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md font-medium transition-all duration-200"
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleSignUp}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md font-medium transition-all duration-200"
        >
          Sign Up
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
    </div>
  );
}
