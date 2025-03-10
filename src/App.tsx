import React from "react";
import OnlineCompilerPage from "@/pages/CompilerPage/CompilerPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "@/pages/LoginPage";
import SignupForm from "@/pages/RegisterPage/RegisterPage";
import VerifyEmail from "@/pages/VerifyEmail";
import Home from "./pages/Home";
import VerifyInfo from "./pages/VerifyInfo";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '@/redux/store';
import AdminLoginForm from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
function App() {
  return (
    <>
    <PersistGate loading={null} persistor={persistor}>
    {/* <Provider store={store}>   */}
      <Router>
        <Routes>
          <Route path="/compiler" element={<OnlineCompilerPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/home" element={<Home />} />
          <Route path="/verify-info" element={<VerifyInfo />} />
          <Route path="/" element={<ProfilePage />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path ="/reset-password" element={<ResetPassword />}></Route>


          <Route path="/admin/login" element={<AdminLoginForm/>}></Route>
          <Route path="/admin/dashboard" element={<AdminDashboard/>}></Route>
        </Routes>
      </Router>
      {/* </Provider> */}
      </PersistGate>
    </>
  );
}

export default App;