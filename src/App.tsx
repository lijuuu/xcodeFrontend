import React from "react";
import OnlineCompilerPage from "@/pages/CompilerPage/CompilerPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "@/pages/LoginPage";
import SignupForm from "@/pages/RegisterPage/RegisterPage";
import VerifyEmail from "@/pages/VerifyEmail";
import Home from "./pages/Home";
import Demo from "./pages/Demo";
import VerifyInfo from "./pages/VerifyInfo";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/compiler" element={<OnlineCompilerPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/home" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/verify-info" element={<VerifyInfo />} />
          <Route path="/" element={<ProfilePage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;