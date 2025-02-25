import React from "react";
import OnlineCompilerPage from "./pages/Compiler/compiler-page";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginForm } from "./pages/Login";
import { SignupForm } from "./pages/Register";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<OnlineCompilerPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;