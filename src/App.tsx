import React from "react";
import OnlineCompilerPage from "@/pages-common/Compiler/CompilerPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "@/pages-user/Auth/LoginPage";
import SignupForm from "@/pages-user/Register/RegisterPage";
import VerifyEmail from "@/pages-user/Auth/VerifyEmail";
import Home from "./pages-user/Home/Home";
import VerifyInfo from "./pages-user/Auth/VerifyInfo";
import ProfilePageOverview from "./pages-user/Profile/ProfileOverviewPage";
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '@/redux/store';
import AdminLoginForm from "./pages-admin/AdminLogin";
import AdminDashboard from "./pages-admin/AdminDashboard";
import ForgotPassword from "./pages-user/Auth/ForgotPassword";
import ResetPassword from "./pages-user/Auth/ResetPassword";
import AddProblems from "@/pages-user/Problem/AddProblems";
import SetUpTwoFactor from "@/pages-user/Profile/components/SetUpTwoFactor";
import NotFound from "@/pages-common/NotFound";

function App() {
  return (
    <>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            <Route path="/compiler" element={<OnlineCompilerPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/home" element={<Home />} />
            <Route path="/verify-info" element={<VerifyInfo />} />
            <Route path="/setup-2fa" element={<SetUpTwoFactor />} />
            <Route path="/" element={<ProfilePageOverview />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />}></Route>


            <Route path="/admin/login" element={<AdminLoginForm />}></Route>
            <Route path="/admin/dashboard" element={<AdminDashboard />}></Route>
            <Route path="/admin/addproblems" element={<AddProblems />}></Route>

            <Route path="*" element={<NotFound />}></Route>
          </Routes>
        </Router>
        {/* </Provider> */}
      </PersistGate>
    </>
  );
}

export default App;