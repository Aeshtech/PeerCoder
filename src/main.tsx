// import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import Room from "./room.tsx";
import { Toaster } from "react-hot-toast";
import CallEnd from "./call-end.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <>
    <Toaster position="top-center" reverseOrder={false} />
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={"/" + uuidV4()} />} />
        <Route path="/:roomId" element={<Room />} />
        <Route path="/thanks" element={<CallEnd />} />
      </Routes>
    </Router>
  </>
  // </React.StrictMode>
);
