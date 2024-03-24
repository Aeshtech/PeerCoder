import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  HashRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import Room from "./room.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={"/" + uuidV4()} />} />
        <Route path="/:roomId" element={<Room />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
