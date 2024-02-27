import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Signup, Integration, Pages, Messenger } from "./Components";
import { UserProvider } from "../src/Components/FbIntegration/UserContext"; // Import the UserProvider
import "./App.css";

const App = () => {
  return (
    <div className="appComponent">
          <UserProvider> {/* Wrap only the relevant components with UserProvider */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Integration />} />
          <Route path="/pages/:pageId" element={<Messenger />} />
          <Route path="/pages" element={<Pages />} />
        </Routes>
      </BrowserRouter>
          </UserProvider> 
    </div>
  );
};

export default App;
