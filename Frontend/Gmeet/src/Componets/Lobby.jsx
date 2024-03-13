import React, { useEffect, useState } from "react";
import { useSocket } from "../Socket";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  

  const socket = useSocket();
  const navigate = useNavigate();

  const handlesumbit = (e) => {
    e.preventDefault();
    socket.emit("room:join", { email, room });
  };

  const handlejoinroom = (data) => {
    const { email, room } = data;
    navigate(`/room/${room}`);
  };

  useEffect(() => {
    socket.on("room:join", handlejoinroom);
    return () => {
      socket.off("room:join", handlejoinroom);
    };
  }, []);

  return (
    <div>
      <h1>lobby</h1>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter Email"
      />
      <input
        type="text"
        id="room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter Room"
      />
      <button onClick={handlesumbit}>Join</button>
    </div>
  );
};
export default Lobby;
