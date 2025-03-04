import React from "react";
import OnlineCompilerPage from "@/pages/CompilerPage/CompilerPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "@/pages/LoginPage";
import SignupForm from "@/pages/RegisterPage";
import VerifyEmail from "@/pages/VerifyEmail";
import Home from "./pages/Home";
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
        </Routes>
      </Router>
    </>
  );
}

export default App;