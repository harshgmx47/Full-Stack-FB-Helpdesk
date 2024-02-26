import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
    <BrowserRouter basename={App}>
      {/* Wrap your App component with BrowserRouter and set basename */}
      <App />
    </BrowserRouter>
    </React.StrictMode>
);
