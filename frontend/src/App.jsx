import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/Chatpage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}