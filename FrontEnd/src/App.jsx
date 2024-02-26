import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Signup, Integration, Pages, Messenger } from "./Components";
import { UserProvider } from "../src/Components/FbIntegration/UserContext"; // Import the UserProvider
import "./App.css";

const App = () => {
  return (
    <div className="appComponent">
      <BrowserRouter>
          <UserProvider> {/* Wrap only the relevant components with UserProvider */}
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Integration />} />
          <Route path="/pages/:pageId" element={<Messenger />} />
          <Route path="/pages" element={<Pages />} />
        </Routes>
          </UserProvider> 
      </BrowserRouter>
    </div>
  );
};

export default App;
