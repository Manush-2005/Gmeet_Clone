import React, { useState, useEffect } from "react";
import { SocketProvider, useSocket } from "../Socket";
import ReactPlayer from "react-player";
import peer from "../WEBRTC/peer";

const Room = () => {
  const socket = useSocket();
  const [otherid, setotherid] = useState(null);
  const [mystream, setmystream] = useState(null);
  const [otherStream, setotherStream] = useState(null);

  const [otheremail, setotheremail] = useState("");

  const handleUserJoined = ({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setotherid(id);
    setotheremail(email);
  };

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handlecalling);
    socket.on("call:accepted", handlecallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handlecalling);
      socket.off("call:accepted", handlecallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [socket, handleUserJoined]);

  const handleNegoNeedIncomming = async ({ from, offer }) => {
    const ans = await peer.acceptAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans });
  };

  const handleNegoNeedFinal = async ({ ans }) => {
    await peer.setLocalDescription(ans);
  };

  const sendStreams = () => {
    for (const track of mystream.getTracks()) {
      peer.peer.addTrack(track, mystream);
    }
  };

  const handlecallAccepted = async ({ from, ans }) => {
    console.log("Call accepted from ", from);
    await peer.setLocalDescription(ans);
    sendStreams(mystream);
  };

  const handlecalling = async ({ from, offer }) => {
    setotherid(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setmystream(stream);

    console.log("Call from ", from);
    const ans = await peer.acceptAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  };

  const handleusercall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: otherid, offer });

    setmystream(stream);
  };

  //
  const handleNegoneeded = async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: otherid });
  };

  //
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoneeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoneeded);
    };
  }, [handleNegoneeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (e) => {
      const otherStream = e.streams;
      console.log("yeah we got");
      setotherStream(otherStream[0]);
    });
  }, []);

  return (
    <>
      <h1>MEETING ROOM </h1>
      <h3> {otherid ? otheremail + " in the room" : "Not Connected"}</h3>
      {/* {mystream && <button onClick={sendStreams}>Send Stream</button>} */}

      {otherid && <button onClick={handleusercall}>CONNNECT</button>}

      {mystream && (
        <div>
          <h1>My video</h1>

          <ReactPlayer
            playing
            muted
            url={mystream}
            height="100px"
            width="200px"
          />
        </div>
      )}
      {otherStream && (
        <div>
          <h1>Thier video</h1>

          <ReactPlayer
            playing
            muted
            url={otherStream}
            height="100px"
            width="200px"
          />
        </div>
      )}
    </>
  );
};
export default Room;
