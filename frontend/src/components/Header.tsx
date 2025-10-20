import {getAuthenticatedUser} from "../api/userApi"
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";

interface ButtonItem {
  label: string;
  onClick: () => void;
}

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // get loggin info
  useEffect(() => {
    async function fetchUser() {
      try {
        if(localStorage.getItem("token") == null) throw new Error("No token");
        const u = await getAuthenticatedUser();
        setUser(u);
        setIsLoggedIn(true);
      } catch (err) {
        setUser(null);
        setIsLoggedIn(false);
      }
    }
    fetchUser();
  }, []);

  // button functions
  const onProfile = () => navigate("/Profile");
  const onLogout = () => navigate("/Logout");
  const onLogin = () => navigate("/Login");
  const onHome = () => navigate("/");

  const buttons : ButtonItem[] = [{label: "Home", onClick: onHome}]

  if(isLoggedIn){
    buttons.push({ label: "Profile", onClick: onProfile });
    buttons.push({ label: "Logout", onClick: onLogout });
  }
  else buttons.push({ label: "Login", onClick: onLogin });

  return (
    <header className="bg-[#1F2A38] text-white">
      <nav className="flex w-full">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className="flex-1 bg-[#1F2A38] hover:bg-[#444D5C] py-8 text-white font-semibold"
          >
            {btn.label}
          </button>
        ))}
      </nav>
    </header>
  );
}