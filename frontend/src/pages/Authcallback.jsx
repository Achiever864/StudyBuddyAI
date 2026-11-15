import { useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../config/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return navigate("/login", { replace: true });

    localStorage.setItem("token", token);

    api("/api/auth/get")
      .then((data) => {
        login(data.user);
        navigate("/chat", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      });
  }, []);

  return (
    <p className="flex min-h-screen items-center justify-center bg-black text-neutral-500">
      Signing you in...
    </p>
  );
}