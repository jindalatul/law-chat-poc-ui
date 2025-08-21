import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// find the div with id="root" in index.html
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <App />
);