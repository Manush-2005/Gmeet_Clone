import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Lobby from "./Componets/Lobby";
import Room from "./Componets/Room";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
